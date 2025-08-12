import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { MarketData } from '../../marketdata/entity/marketdata.entity';
import { Order } from '../../orders/entity/order.entity';

export type InstrumentType = 'ACCION' | 'BONO' | 'ETF' | 'CEDEAR' | 'MONEDA';

@Entity('instruments')
export class Instrument {
  @PrimaryGeneratedColumn() 
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  ticker: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 10 })
  type: InstrumentType;

  @OneToMany(() => Order, o => o.instrument) 
  orders: Order[];
  
  @OneToMany(() => MarketData, md => md.instrument) 
  marketData: MarketData[];
}
