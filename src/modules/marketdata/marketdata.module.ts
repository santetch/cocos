import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataService } from './service/marketdata.service';
import { MarketDataController } from './controller/marketdata.controller';
import { MarketData } from './entity/marketdata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketData])],
  providers: [MarketDataService],
  controllers: [MarketDataController],
  exports: [MarketDataService]
})
export class MarketDataModule {}
