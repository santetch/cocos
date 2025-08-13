import { Test, TestingModule } from '@nestjs/testing';
import { InstrumentsService } from '../../../../src/modules/instruments/service/instrument.service';
import { PortfolioRepository } from '../../../../src/modules/porfolio/repository/portfolio.repository';
import { PortfolioService } from '../../../../src/modules/porfolio/service/portfolio.service';

describe('Profolio Service', () => {
  let portfolioService: PortfolioService;

  let instrumentsService: InstrumentsService;

  let repository: PortfolioRepository;

  const userId = 1;

  beforeEach(async () => {
    const app: TestingModule = await createTestApp();

    portfolioService = app.get<PortfolioService>(PortfolioService);
    instrumentsService = app.get<InstrumentsService>(InstrumentsService);
    repository = app.get<PortfolioRepository>(PortfolioRepository);
  });

  it('should calculate portfolio correctly', async () => {
    const portfolio = await portfolioService.getPortfolio(userId);

    expect(portfolio).toHaveProperty('userId', userId);
    expect(portfolio).toHaveProperty('cash');
    expect(portfolio).toHaveProperty('totalValue');
    expect(portfolio).toHaveProperty('positions');
  });

  it('should get cash for user', async () => {
    await portfolioService.getPortfolio(userId);

    expect(repository.getCashFor).toHaveBeenCalledWith(userId);
  });

  it('should get net shares per instrument', async () => {
    await portfolioService.getPortfolio(userId);

    expect(repository.getNetSharesFor).toHaveBeenCalledWith(userId);
  });

  it('should return empty positions if no shares', async () => {
    jest.spyOn(repository, 'getNetSharesFor').mockResolvedValue([]);

    const portfolio = await portfolioService.getPortfolio(userId);

    expect(portfolio.positions).toEqual([]);
  });

  it('should get market data for instruments', async () => {
    jest.spyOn(repository, 'getNetSharesFor').mockResolvedValue([
      { instrumentId: 1, shares: '10' },
      { instrumentId: 2, shares: '5' }
    ]);

    await portfolioService.getPortfolio(userId);

    expect(instrumentsService.getLatestPricesFor).toHaveBeenCalledWith([1, 2]);
  });

  it('should load instruments by IDs', async () => {
    jest.spyOn(repository, 'getNetSharesFor').mockResolvedValue([
      { instrumentId: 1, shares: '10' },
      { instrumentId: 2, shares: '5' }
    ]);

    await portfolioService.getPortfolio(userId);

    expect(instrumentsService.findByIds).toHaveBeenCalledWith([1, 2]);
  });

  const createTestApp = async () => {
    return await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PortfolioRepository,
          useValue: {
            getCashFor: jest.fn().mockResolvedValue({ cash: '1000.00' }),
            getNetSharesFor: jest.fn().mockResolvedValue([
              { instrumentId: 1, shares: '10' },
              { instrumentId: 2, shares: '5' }
            ])
          }
        },
        {
          provide: InstrumentsService,
          useValue: {
            getInstrumentById: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Test Instrument',
              symbol: 'TEST'
            }),
            getLatestPricesFor: jest.fn().mockResolvedValue({
              1: { close: '100.00', previousClose: '95.00' },
              2: { close: '200.00', previousClose: '190.00' }
            }),
            findByIds: jest.fn().mockResolvedValue([
              { id: 1, ticker: 'TEST1', name: 'Test Instrument 1', type: 'STOCK' },
              { id: 2, ticker: 'TEST2', name: 'Test Instrument 2', type: 'STOCK' }
            ])
          }
        }
      ]
    }).compile();
  };
});
