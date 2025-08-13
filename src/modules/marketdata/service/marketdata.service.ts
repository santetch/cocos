import { Injectable } from '@nestjs/common';
import { MarketDataRepository } from '../repository/marketdata.repository';
import { MarketData } from '../entity/marketdata.entity';

@Injectable()
export class MarketDataService {
  constructor(private readonly repository: MarketDataRepository) {}

  async getLatestFor(instrumentId: number): Promise<MarketData | null> {
    return await this.repository.getLatestFor(instrumentId);
  }

  async getRecentFor(instrumentId: number, limit = 50): Promise<MarketData[]> {
    return await this.repository.getRecentFor(instrumentId, limit);
  }
}
