// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { Instrument } from '../instruments/entity/instrument.entity';
import { Order } from './entity/order.entity';
import { MarketData } from '../marketdata/entity/marketdata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Instrument, MarketData])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
