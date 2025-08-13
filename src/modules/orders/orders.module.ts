// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './service/orders.service';
import { Instrument } from '../instruments/entity/instrument.entity';
import { Order } from './entity/order.entity';
import { MarketData } from '../marketdata/entity/marketdata.entity';
import { OrdersRepository } from './repository/orders.repository';
import { InstrumentsModule } from '../instruments/instruments.module';
import { MarketDataModule } from '../marketdata/marketdata.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Instrument, MarketData]), InstrumentsModule, MarketDataModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService]
})
export class OrdersModule {}
