import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Order } from '../../orders/entity/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 }) email: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 }) accountNumber: string;

  @OneToMany(() => Order, o => o.user) orders: Order[];
}
