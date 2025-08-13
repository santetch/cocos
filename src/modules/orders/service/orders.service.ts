import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { Order, OrderStatus } from '../entity/order.entity';
import { OrdersRepository } from '../repository/orders.repository';
import { CreateOrderDTO } from '../dto/create-order.dto';
import { InstrumentsRepository } from '../../instruments/repositoy/instrument.repository';
import { MarketDataRepository } from '../../marketdata/repository/marketdata.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repository: OrdersRepository,
    private readonly instrumentsRepository: InstrumentsRepository,
    private readonly marketDataRepository: MarketDataRepository
  ) {}

  async create(dto: CreateOrderDTO) {
    await this.validateInstrument(dto.instrumentId);

    const isCashOp = this.validateCashOperation(dto);

    const execPrice = await this.getExecutionPrice(dto, isCashOp);

    const size = this.getExecutionSize(dto, isCashOp, execPrice);

    // Validate user balances (FILLED-only orders are counted)
    // For LIMIT we validate affordability/availability at submission price
    // For MARKET we validate with execPrice

    const cash = await this.repository.getAvailableCashForUser(dto.userId);

    const shares = await this.repository.getAvailableSharesFor(dto.userId, dto.instrumentId);

    const { status, reason } = this.validateStatusAndReason(dto, isCashOp, cash, size, execPrice, shares);

    // Persist order
    const order = this.createOrder(dto, reason, size, execPrice, status);

    const saved = await this.repository.save(order);

    return { id: saved.id, status: saved.status, reason: saved.reason ?? null };
  }

  async cancel(id: number): Promise<{ id: number; status: OrderStatus; reason: string | null }> {
    const order = await this.repository.getOrdersForUser(id);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'NEW') {
      throw new ConflictException('Only NEW orders can be cancelled');
    }

    order.status = 'CANCELLED';
    await this.repository.save(order);

    return { id: order.id, status: order.status, reason: order.reason ?? null };
  }

  private async validateInstrument(instrumentId: number) {
    const instrument = await this.instrumentsRepository.findOneById(instrumentId);

    if (!instrument) throw new BadRequestException('Unknown instrument');

    return instrument;
  }

  private validateCashOperation(dto: CreateOrderDTO) {
    // CASH ops are always MARKET and use price=1 on the ARS instrument (size=ARS amount)
    const isCashOp = dto.side === 'CASH_IN' || dto.side === 'CASH_OUT';

    if (!isCashOp && dto.size == null && dto.amount == null) {
      throw new BadRequestException('Provide size or amount');
    }
    if (dto.size != null && dto.amount != null) {
      throw new BadRequestException('Provide either size or amount, not both');
    }
    if (dto.type === 'LIMIT' && !dto.price && !isCashOp) {
      throw new BadRequestException('LIMIT orders require price');
    }

    return isCashOp;
  }

  private async getExecutionPrice(dto: CreateOrderDTO, isCashOp: boolean) {
    // Resolve execution price for MARKET (equities) or validate LIMIT price
    let execPrice = new Decimal(0);

    if (isCashOp) {
      execPrice = new Decimal(1); // ARS 1:1 for cash movements
    } else if (dto.type === 'MARKET') {
      const last = await this.marketDataRepository.getLatestFor(dto.instrumentId);

      if (!last) throw new BadRequestException('No market data for instrument');

      execPrice = new Decimal(last.close);
    } else {
      execPrice = new Decimal(dto.price);
    }

    return execPrice;
  }

  private getExecutionSize(dto: CreateOrderDTO, isCashOp: boolean, execPrice: Decimal): Decimal {
    // Derive size from amount if needed (BUY only; SELL with amount doesn’t make sense)
    let size = dto.size ?? null;

    if (!isCashOp && size == null && dto.amount != null) {
      const s = new Decimal(dto.amount).div(execPrice).floor();

      if (s.lte(0)) throw new BadRequestException('Amount too small for at least 1 share');

      size = s.toNumber();
    }

    if (isCashOp) {
      // Cash size is ARS integer amount
      size = dto.size ?? dto.amount ?? 0;
    }

    return new Decimal(size);
  }

  private validateStatusAndReason(
    dto: CreateOrderDTO,
    isCashOp: boolean,
    cash: Decimal,
    size: Decimal,
    execPrice: Decimal,
    shares: Decimal
  ): { status: OrderStatus; reason: string | null } {
    let status: OrderStatus = 'NEW';
    let reason: string | null = null;

    if (isCashOp) {
      if (dto.side === 'CASH_OUT') {
        if (cash.lt(size)) {
          status = 'REJECTED';
          reason = 'Insufficient cash';
        } else {
          status = 'FILLED';
        }
      } else {
        status = 'FILLED';
      }
    } else if (dto.side === 'BUY') {
      const cost = size.mul(execPrice);
      if (cash.lt(cost)) {
        status = 'REJECTED';
        reason = 'Insufficient cash';
      } else {
        status = dto.type === 'MARKET' ? 'FILLED' : 'NEW';
      }
    } else if (dto.side === 'SELL') {
      if (shares.lt(size)) {
        status = 'REJECTED';
        reason = 'Insufficient shares';
      } else {
        status = dto.type === 'MARKET' ? 'FILLED' : 'NEW';
      }
    }

    return { status, reason };
  }

  private createOrder(dto: CreateOrderDTO, reason: string, size: Decimal, execPrice: Decimal, status: string) {
    return Object.assign(new Order(), {
      instrumentId: dto.instrumentId,
      userId: dto.userId,
      side: dto.side,
      size: size.toNumber(),
      price: execPrice.toFixed(4),
      type: dto.type,
      status,
      reason: reason ?? undefined,
      correlation_id: dto.correlationId ?? undefined
    });
  }
}
