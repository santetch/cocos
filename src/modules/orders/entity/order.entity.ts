import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Instrument } from '../../instruments/entity/instrument.entity';
import { User } from '../../persistance/entities/user.entity';

export type OrderSide = 'BUY' | 'SELL' | 'CASH_IN' | 'CASH_OUT';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'NEW' | 'FILLED' | 'REJECTED' | 'CANCELLED';

@Entity('orders')
@Index(['userId', 'instrumentId', 'status'])
@Index(['datetime'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  instrumentId: number;

  @ManyToOne(() => Instrument, i => i.orders, { onDelete: 'RESTRICT' })
  instrument: Instrument;

  @ManyToOne(() => User, u => u.orders, { onDelete: 'RESTRICT' })
  user: User;

  @Column({ type: 'varchar' })
  side: OrderSide;

  @Column({ type: 'int' })
  size: number; // shares OR ARS for cash ops

  // numeric stored as string to avoid JS float issues
  @Column({ type: 'numeric', precision: 18, scale: 4 })
  price: string;

  @Column({ type: 'varchar' })
  type: OrderType;

  @Column({ type: 'varchar' })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'datetime' })
  datetime: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  correlation_id?: string;
}
