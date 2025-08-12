import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MarketData } from '../entity/marketdata.entity';


@Injectable()
export class MarketDataService {
  constructor(
    @InjectRepository(MarketData) private readonly mdRepo: Repository<MarketData>,
  ) {}

  async getLatestForInstrument(instrumentId: number) {
    return this.mdRepo.findOne({
      where: { instrumentId },
      order: { datetime: 'DESC' },
    });
  }

  /**
   * Efficiently fetch the latest row for many instruments at once.
   * Uses DISTINCT ON (instrumentId) via raw SQL for performance.
   */
  async getLatestForInstruments(instrumentIds: number[]) {
    if (!instrumentIds.length) return [];
    const rows = await this.mdRepo.query(
      `
      SELECT DISTINCT ON ("instrumentId")
             "instrumentId", high, low, open, close, "previousClose", datetime
      FROM marketdata
      WHERE "instrumentId" = ANY($1)
      ORDER BY "instrumentId", datetime DESC
      `,
      [instrumentIds],
    );
    return rows;
  }

  async getRecentForInstrument(instrumentId: number, limit = 50) {
    return this.mdRepo.find({
      where: { instrumentId },
      order: { datetime: 'DESC' },
      take: limit,
    });
  }
}
