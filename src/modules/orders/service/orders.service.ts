import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { Order, OrderStatus } from '../entity/order.entity';
import { Instrument } from '~src/modules/instruments/entity/instrument.entity';
import { CreateOrderDTO } from '../dto/create-order.dto';
import { MarketData } from '~src/modules/marketdata/entity/marketdata.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(MarketData) private readonly mdRepo: Repository<MarketData>,
    @InjectRepository(Instrument) private readonly instrumentsRepo: Repository<Instrument>,
  ) {}

  async create(dto: CreateOrderDTO) {
    // Basic guards
    const instrument = await this.instrumentsRepo.findOneBy({ id: dto.instrumentId });
    if (!instrument) throw new BadRequestException('Unknown instrument');

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

    return this.dataSource.transaction(async (manager) => {
      // Idempotency (optional): if a correlationId exists and was used, return the existing order
      if (dto.correlationId) {
        const existing = await manager.getRepository(Order).findOne({
          where: { correlation_id: dto.correlationId },
        });
        if (existing) {
          return { id: existing.id, status: existing.status, reason: existing.reason ?? null };
        }
      }

      // Resolve execution price for MARKET (equities) or validate LIMIT price
      let execPrice = new Decimal(0);
      if (isCashOp) {
        execPrice = new Decimal(1); // ARS 1:1 for cash movements
      } else if (dto.type === 'MARKET') {
        const last = await manager.getRepository(MarketData).findOne({
          where: { instrumentId: dto.instrumentId },
          order: { datetime: 'DESC' },
        });
        if (!last) throw new BadRequestException('No market data for instrument');
        execPrice = new Decimal(last.close);
      } else {
        execPrice = new Decimal(dto.price!);
      }

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

      // Validate user balances (FILLED-only orders are counted)
      // For LIMIT we validate affordability/availability at submission price
      // For MARKET we validate with execPrice
      const priceForValidation = execPrice;

      // Available cash
      const cashRow = await manager.query(
        `
        SELECT COALESCE(SUM(
          CASE
            WHEN side='CASH_IN'  AND status='FILLED' THEN size
            WHEN side='CASH_OUT' AND status='FILLED' THEN -size
            WHEN side='BUY'      AND status='FILLED' THEN -(size*price)
            WHEN side='SELL'     AND status='FILLED' THEN  (size*price)
            ELSE 0
          END
        ),0)::numeric(18,4) AS cash
        FROM orders
        WHERE "userId" = $1
        `,
        [dto.userId],
      );
      const cash = new Decimal(cashRow?.[0]?.cash ?? 0);

      // Available shares for this instrument
      const sharesRow = await manager.query(
        `
        SELECT COALESCE(SUM(
          CASE
            WHEN side='BUY'  AND status='FILLED' THEN size
            WHEN side='SELL' AND status='FILLED' THEN -size
            ELSE 0
          END
        ),0)::numeric(18,4) AS shares
        FROM orders
        WHERE "userId" = $1 AND "instrumentId" = $2
        `,
        [dto.userId, dto.instrumentId],
      );
      const shares = new Decimal(sharesRow?.[0]?.shares ?? 0);

      // Domain validations
      const sz = new Decimal(size!);
      let status: OrderStatus = 'NEW';
      let reason: string | null = null;

      if (isCashOp) {
        if (dto.side === 'CASH_OUT') {
          if (cash.lt(sz)) {
            status = 'REJECTED';
            reason = 'Insufficient cash';
          } else {
            status = 'FILLED';
          }
        } else {
          status = 'FILLED';
        }
      } else if (dto.side === 'BUY') {
        const cost = sz.mul(priceForValidation);
        if (cash.lt(cost)) {
          status = 'REJECTED';
          reason = 'Insufficient cash';
        } else {
          status = dto.type === 'MARKET' ? 'FILLED' : 'NEW';
        }
      } else if (dto.side === 'SELL') {
        if (shares.lt(sz)) {
          status = 'REJECTED';
          reason = 'Insufficient shares';
        } else {
          status = dto.type === 'MARKET' ? 'FILLED' : 'NEW';
        }
      }

      // Persist order
      const order = manager.getRepository(Order).create({
        instrumentId: dto.instrumentId,
        userId: dto.userId,
        side: dto.side,
        size: sz.toNumber(),
        price: execPrice.toFixed(4),
        type: dto.type,
        status,
        reason: reason ?? null,
        correlation_id: dto.correlationId ?? null,
      });
      const saved = await manager.getRepository(Order).save(order);

      return { id: saved.id, status: saved.status, reason: saved.reason ?? null };
    });
  }

  async cancel(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const ord = await repo.findOne({ where: { id } });
      if (!ord) throw new NotFoundException('Order not found');

      if (ord.status !== 'NEW') {
        throw new ConflictException('Only NEW orders can be cancelled');
      }

      ord.status = 'CANCELLED';
      await repo.save(ord);
      return { id: ord.id, status: ord.status, reason: ord.reason ?? null };
    });
  }
}
