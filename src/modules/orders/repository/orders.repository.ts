import { Injectable } from '@nestjs/common';
import { Order } from '../entity/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';

@Injectable()
export class OrdersRepository {
  constructor(@InjectRepository(Order) private readonly repository: Repository<Order>) {}

  async getOrdersForUser(id: number): Promise<Order | null> {
    return await this.repository.findOneBy({ id });
  }

  async save(order: Order): Promise<Order> {
    return await this.repository.save(order);
  }

  async getAvailableCashForUser(userId: number) {
    const cashRow = await this.repository.query(
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
    );

    return new Decimal(cashRow?.[0]?.cash ?? 0);
  }

  async getAvailableSharesFor(userId: number, instrumentId: number) {
    // Available shares for this instrument
    const sharesRow = await this.repository.query(
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
      [userId, instrumentId]
    );

    return new Decimal(sharesRow?.[0]?.shares ?? 0);
  }
}
