import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PortfolioRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getCashFor(userId: number): Promise<{ cash: any }> {
    return await this.dataSource
      .query(
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
        [userId]
      )
      .then(r => r[0] ?? { cash: '0' });
  }

  async getNetSharesFor(userId: number): Promise<{ instrumentId: number; shares: string }[]> {
    return await this.dataSource.query(
      `
      SELECT "instrumentId",
              COALESCE(SUM(
                CASE
                  WHEN side='BUY'  AND status='FILLED' THEN size
                  WHEN side='SELL' AND status='FILLED' THEN -size
                  ELSE 0
                END
              ),0)::numeric(18,4) AS shares
      FROM orders
      WHERE "userId" = $1
      GROUP BY "instrumentId"
      HAVING COALESCE(SUM(
                CASE
                  WHEN side='BUY'  AND status='FILLED' THEN size
                  WHEN side='SELL' AND status='FILLED' THEN -size
                  ELSE 0
                END
              ),0) <> 0
    `,
      [userId]
    );
  }
}
