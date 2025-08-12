import { Test, TestingModule } from "@nestjs/testing";
import { InstrumentsRepository } from "../../../../src/modules/instruments/repositoy/instrument.repository";
import { InstrumentsService } from "../../../../src/modules/instruments/service/instrument.service";

describe('Instrument Service', () => {
    let instrumentsService: InstrumentsService;

    beforeEach(async () => {
        const app: TestingModule = await createTestApp();
        instrumentsService = app.get<InstrumentsService>(InstrumentsService);
    });

    describe('when searching instruments', () => { 
        it('should find instruments by query', async () => {
            const query = 'AAPL';
            const page = 1;
            const pageSize = 10;

            jest.spyOn(instrumentsService, 'search').mockResolvedValue([
                { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO' }
            ]);

            const results = await instrumentsService.search({ query, page, pageSize });

            expect(results).toEqual([
                { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO' }
            ]);
        });
    });

    describe('when finding instruments by IDs', () => {
        it('should return instruments for given IDs', async () => {
            const ids = [1, 2];
            
            jest.spyOn(instrumentsService, 'findByIds').mockResolvedValue([
                { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO', orders: [], marketData: [] },
                { id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'BONO', orders: [], marketData: [] }
            ]);
            
            const results = await instrumentsService.findByIds(ids);

            expect(results).toEqual([
                { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO', orders: [], marketData: [] },
                { id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'BONO', orders: [], marketData: [] }
            ]);
        });
    });

    describe('when getting latest prices for instruments', () => {
        it('should return latest prices for given instrument IDs', async () => {
            const instrumentIds = [1, 2];

            jest.spyOn(instrumentsService, 'getLatestPricesFor').mockResolvedValue({
                1: { close: '150.00', previousClose: '148.00' },
                2: { close: '2800.00', previousClose: '2750.00' }
            });

            const prices = await instrumentsService.getLatestPricesFor(instrumentIds);

            expect(prices).toEqual({
                1: { close: '150.00', previousClose: '148.00' },
                2: { close: '2800.00', previousClose: '2750.00' }
            });
        });
    });

    const createTestApp = async () => {
        return await Test.createTestingModule({
            providers: [
                InstrumentsService,
                {
                    provide: InstrumentsRepository,
                    useValue: {
                        find: jest.fn().mockResolvedValue([
                            { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO' }
                        ]),
                        findByIds: jest.fn().mockResolvedValue([
                            { id: 1, ticker: 'AAPL', name: 'Apple Inc.', type: 'BONO' }
                        ]),
                        getPricesFor: jest.fn().mockResolvedValue([
                            { instrumentId: 1, close: '150.00', previousClose: '148.00' }
                        ])
                    }
                }
            ],
        }).compile();
    }
});