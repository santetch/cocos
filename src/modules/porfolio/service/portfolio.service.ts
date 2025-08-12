// portfolio/portfolio.service.ts
import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { InstrumentsService } from '../../instruments/service/instrument.service';
import { PortfolioRepository } from '../repository/portfolio.repository';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly repository: PortfolioRepository,
    private readonly instrumentsService: InstrumentsService
  ) { }

  async getPortfolio(userId: number) {
    // 1) Cash (ARS)
    const { cash } = await this.repository.getCashFor(userId);

    // 2) Net shares per instrument (exclude MONEDA)
    const shareRows: Array<{ instrumentId: number, shares: string }> = await this.repository.getNetSharesFor(userId);

    const instrumentIds = shareRows.map(r => r.instrumentId);

    if (instrumentIds.length === 0) return this.returnEmptyPortfolio(userId, cash);

    // 3) Latest close & previousClose for those instruments (one shot)
    const prices = await this.instrumentsService.getLatestPricesFor(instrumentIds);

    // 4) Load instrument meta (name/ticker)
    const instruments = await this.instrumentsService.findByIds(instrumentIds);
    const byId = new Map(instruments.map(i => [i.id, i]));

    // 5) Build positions & totals
    const { total, positions } = this.buildPositions(shareRows, prices, byId, cash);

    return {
      userId,
      cash: new Decimal(cash).toFixed(2),
      totalValue: total.toFixed(2),
      positions,
    };
  }

  private returnEmptyPortfolio(userId: number, cash: any) {
    return {
      userId,
      cash: new Decimal(cash).toFixed(2),
      totalValue: new Decimal(cash).toFixed(2),
      positions: [],
    };
  }

  private buildPositions(shareRows: Array<{ instrumentId: number, shares: string }>, prices: Record<number, { close: string; previousClose: string }>, byId: Map<number, any>, cash: any) {
    let total = new Decimal(cash);

    const positions = shareRows.map(({ instrumentId, shares }) => {
      const info = byId.get(instrumentId);
      const px = prices[instrumentId];
      const close = new Decimal(px?.close ?? 0);
      const prev = new Decimal(px?.previousClose ?? 0);
      const qty = new Decimal(shares);
      const marketValue = qty.mul(close);
      total = total.add(marketValue);

      const dailyReturnPct = prev.gt(0) ? close.div(prev).minus(1) : new Decimal(0);

      return {
        instrumentId,
        ticker: info?.ticker ?? String(instrumentId),
        name: info?.name ?? '',
        shares: qty.toFixed(4),
        close: close.toFixed(4),
        previousClose: prev.toFixed(4),
        marketValue: marketValue.toFixed(2),
        dailyReturnPct: dailyReturnPct.toFixed(6),
      };
    });

    return { total, positions }
  }
}
