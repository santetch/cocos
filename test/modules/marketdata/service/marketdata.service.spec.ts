import { Test, TestingModule } from "@nestjs/testing";
import { MarketData } from "../../../../src/modules/marketdata/entity/marketdata.entity";
import { MarketDataRepository } from "../../../../src/modules/marketdata/repository/marketdata.repository";
import { MarketDataService } from "../../../../src/modules/marketdata/service/marketdata.service";


describe('MarketData Service', () => {
    let service: MarketDataService;

    let repository: MarketDataRepository;

    const instrumentId = 1;

    beforeEach(async () => {
        const app: TestingModule = await createTestApp();

        service = app.get<MarketDataService>(MarketDataService);

        repository = app.get<MarketDataRepository>(MarketDataRepository);
    });

    it('should get latest market data for instrument', async () => {
        const latestData = new MarketData();
        completeMarketData(latestData);

        jest.spyOn(repository, 'getLatestFor').mockResolvedValue(latestData);

        const result = await service.getLatestFor(instrumentId);

        expect(result).toEqual(latestData);
    });

    it('should get recent market data for instrument', async () => {
        const recentData = [new MarketData(), new MarketData()];
        completeMarketData(recentData[0]);
        completeMarketData(recentData[1]);

        jest.spyOn(repository, 'getRecentFor').mockResolvedValue(recentData);

        const result = await service.getRecentFor(instrumentId, 1);

        expect(result).toEqual(recentData);
    });

    it('should return only one recent market data if limit is 1', async () => {
        const recentData = [new MarketData(), new MarketData()];
        completeMarketData(recentData[0]);
        completeMarketData(recentData[1]);

        jest.spyOn(repository, 'getRecentFor').mockResolvedValue([recentData[0]]);

        const result = await service.getRecentFor(instrumentId, 1);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(recentData[0]);
    });

    const completeMarketData = (marketdata: MarketData) => {
        marketdata.instrumentId = instrumentId;
        marketdata.datetime = new Date();
        marketdata.open = '100';
        marketdata.high = '105';
        marketdata.low = '95';
        marketdata.close = '102';
        marketdata.previousClose = '98';
    }

    const createTestApp = async () => {
        return await Test.createTestingModule({
            providers: [
                MarketDataService,
                {
                    provide: MarketDataRepository,
                    useValue: {
                        getLatestFor: jest.fn().mockResolvedValue(new MarketData()),
                        getRecentFor: jest.fn().mockResolvedValue([new MarketData()]),
                    }
                }
            ],
        }).compile();
    }
});