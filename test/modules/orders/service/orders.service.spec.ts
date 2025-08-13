import { Test, TestingModule } from '@nestjs/testing';
import Decimal from 'decimal.js';
import { OrdersRepository } from '../../../../src/modules/orders/repository/orders.repository';
import { OrdersService } from '../../../../src/modules/orders/service/orders.service';
import { Order } from '../../../../src/modules/orders/entity/order.entity';
import { CreateOrderDTO } from '../../../../src/modules/orders/dto/create-order.dto';
import { InstrumentsRepository } from '../../../../src/modules/instruments/repositoy/instrument.repository';
import { MarketDataRepository } from '../../../../src/modules/marketdata/repository/marketdata.repository';

describe('Orders Service', () => {
  let service: OrdersService;

  let repository: OrdersRepository;

  let instrumentsRepository: InstrumentsRepository;

  let marketdataRepository: MarketDataRepository;

  const userId = 1;

  const NEW_ORDER = {
    id: userId,
    status: 'NEW',
    reason: null
  } as Order;

  const CANCELLED_ORDER = {
    id: userId,
    status: 'CANCELLED',
    reason: null
  } as Order;

  const CREATE_ORDER_DTO = {
    instrumentId: 1,
    userId,
    side: 'SELL',
    size: 10,
    price: '100',
    type: 'MARKET'
  } as CreateOrderDTO;

  const ORDER_TO_CREATE = Object.assign(new Order(), {
    ...CREATE_ORDER_DTO,
    price: '100.0000',
    status: 'REJECTED',
    reason: 'Insufficient shares'
  });

  beforeEach(async () => {
    const app: TestingModule = await createTestApp();

    service = app.get<OrdersService>(OrdersService);
    repository = app.get<OrdersRepository>(OrdersRepository);
    instrumentsRepository = app.get<InstrumentsRepository>(InstrumentsRepository);
    marketdataRepository = app.get<MarketDataRepository>(MarketDataRepository);
  });

  describe('when creating an order', () => {
    it('should get instrument', async () => {
      await service.create(CREATE_ORDER_DTO);

      expect(instrumentsRepository.findOneById).toHaveBeenCalledWith(CREATE_ORDER_DTO.instrumentId);
    });

    it('should throw BadRequestException if instrument does not exist', async () => {
      jest.spyOn(instrumentsRepository, 'findOneById').mockResolvedValue(null);

      await expect(service.create(CREATE_ORDER_DTO)).rejects.toThrow('Unknown instrument');
    });

    it('should throw BadRequestException if size and amount are not provided', async () => {
      const dto = { ...CREATE_ORDER_DTO, size: null, amount: null } as CreateOrderDTO;

      await expect(service.create(dto)).rejects.toThrow('Provide size or amount');
    });

    it('should throw BadRequestException if both size and amount are provided', async () => {
      const dto = { ...CREATE_ORDER_DTO, size: 10, amount: 100 } as CreateOrderDTO;

      await expect(service.create(dto)).rejects.toThrow('Provide either size or amount, not both');
    });

    it('should throw BadRequestException if LIMIT order does not have price', async () => {
      const dto = { ...CREATE_ORDER_DTO, type: 'LIMIT', price: null } as CreateOrderDTO;

      await expect(service.create(dto)).rejects.toThrow('LIMIT orders require price');
    });

    it.skip('should get execution price for cash operations', async () => {
      const dto = { ...CREATE_ORDER_DTO, side: 'CASH_IN', size: null, amount: 100 } as CreateOrderDTO;

      const execPrice = await service.create(dto);

      expect(execPrice).toEqual(new Decimal(1));
    });

    it('should get execution price for MARKET orders', async () => {
      const dto = { ...CREATE_ORDER_DTO, type: 'MARKET' } as CreateOrderDTO;

      await service.create(dto);

      expect(marketdataRepository.getLatestFor).toHaveBeenCalledWith(dto.instrumentId);
    });

    it('should get execution price for LIMIT orders', async () => {
      const dto = { ...CREATE_ORDER_DTO, type: 'LIMIT' } as CreateOrderDTO;

      await service.create(dto);

      expect(marketdataRepository.getLatestFor).not.toHaveBeenCalled();
    });

    it.skip('should get execution size from amount if needed', async () => {
      const dto = { ...CREATE_ORDER_DTO, size: null, amount: 100 } as CreateOrderDTO;

      const execSize = await service.create(dto);

      expect(execSize).toEqual(new Decimal(1));
    });

    it('should throw BadRequestException if amount is too small for at least 1 share', async () => {
      const dto = { ...CREATE_ORDER_DTO, side: 'BUY', size: null, amount: 0.1 } as CreateOrderDTO;

      await expect(service.create(dto)).rejects.toThrow('Amount too small for at least 1 share');
    });

    it('should get available cash for user', async () => {
      await service.create(CREATE_ORDER_DTO);

      expect(repository.getAvailableCashForUser).toHaveBeenCalledWith(CREATE_ORDER_DTO.userId);
    });

    it('should get available shares for instrument', async () => {
      await service.create(CREATE_ORDER_DTO);

      expect(repository.getAvailableSharesFor).toHaveBeenCalledWith(
        CREATE_ORDER_DTO.userId,
        CREATE_ORDER_DTO.instrumentId
      );
    });

    it('should create an order', async () => {
      await service.create(CREATE_ORDER_DTO);

      expect(repository.save).toHaveBeenCalledWith(ORDER_TO_CREATE);
    });
  });

  describe('when cancelling an order', () => {
    it('should call repository to get orders for user', async () => {
      try {
        await service.cancel(userId);
      } catch {
      } finally {
        expect(repository.getOrdersForUser).toHaveBeenCalledWith(userId);
      }
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest.spyOn(repository, 'getOrdersForUser').mockResolvedValue(null);

      await expect(service.cancel(userId)).rejects.toThrow('Order not found');
    });

    it('should throw ConflictException if order is not NEW', async () => {
      jest.spyOn(repository, 'getOrdersForUser').mockResolvedValue({
        id: userId,
        status: 'FILLED',
        reason: null
      } as Order);

      await expect(service.cancel(userId)).rejects.toThrow('Only NEW orders can be cancelled');
    });

    it('should update order status to CANCELLED', async () => {
      jest.spyOn(repository, 'getOrdersForUser').mockResolvedValue(NEW_ORDER);
      jest.spyOn(repository, 'save').mockResolvedValue(CANCELLED_ORDER);

      const result = await service.cancel(userId);

      expect(result).toEqual({ id: userId, status: 'CANCELLED', reason: null });
      expect(repository.save).toHaveBeenCalledWith(CANCELLED_ORDER);
    });
  });

  const createTestApp = async () => {
    return await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: {
            getOrdersForUser: jest.fn().mockResolvedValue([]),
            save: jest.fn().mockResolvedValue({ id: 1, status: 'CANCELLED', reason: null }),
            getAvailableCashForUser: jest.fn().mockResolvedValue(Decimal(100)),
            getAvailableSharesFor: jest.fn().mockResolvedValue(Decimal(5))
          }
        },
        {
          provide: InstrumentsRepository,
          useValue: {
            findOneById: jest.fn().mockResolvedValue({ id: 1, name: 'Test Instrument' })
          }
        },
        {
          provide: MarketDataRepository,
          useValue: {
            getLatestFor: jest.fn().mockResolvedValue({ close: '100' })
          }
        }
      ]
    }).compile();
  };
});
