import { Injectable } from '@nestjs/common';
import { Instrument } from '../entity/instrument.entity';
import { SearchInstrumentsDTO } from '../dto/search-instrument.dto';
import { InstrumentsRepository } from '../repositoy/instrument.repository';

@Injectable()
export class InstrumentsService {

  constructor(
    private readonly repository: InstrumentsRepository
  ) { }

  async search({ query = '', page = 1, pageSize = 25 }: SearchInstrumentsDTO) {
    const rows = await this.repository.find(query, page, pageSize);

    return rows.map(r => ({
      id: r.id,
      ticker: r.ticker,
      name: r.name,
      type: r.type,
    }));
  }

  async findByIds(ids: any[]): Promise<Instrument[]> {
    return await this.repository.findByIds(ids);
  }

  async getLatestPricesFor(instrumentIds: number[]): Promise<any> {
    const priceRows = await this.repository.getPricesFor(instrumentIds);

    return this.createPriceMap(priceRows);
  }

  private createPriceMap(priceRows: any[]): any {
    // const prices: Record<number, { close: string; previousClose: string }> = {};

    // priceRows.forEach((r: any) => {
    //   prices[r.instrumentId] = { close: r.close, previousClose: r.previousClose };
    // });

    // return prices;

    return priceRows.map((r: any) => ({
      instrumentId: r.instrumentId,
      close: r.close,
      previousClose: r.previousClose,
    }));
  }
}
