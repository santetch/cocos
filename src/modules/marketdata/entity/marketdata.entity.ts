import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Instrument } from '../../instruments/entity/instrument.entity';

@Entity('marketdata')
@Index(['instrumentId', 'datetime'])
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentId: number;

  @ManyToOne(() => Instrument, i => i.marketData, { onDelete: 'CASCADE', cascade: ['insert'] })
  instrument: Instrument;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  high: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  low: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  open: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  close: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  previousClose: string;

  @Column({ type: 'timestamptz' })
  datetime: Date;
}
