import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataService } from './service/marketdata.service';
import { MarketDataController } from './controller/marketdata.controller';
import { MarketData } from './entity/marketdata.entity';
import { MarketDataRepository } from './repository/marketdata.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MarketData])],
  providers: [MarketDataService, MarketDataRepository],
  controllers: [MarketDataController],
  exports: [MarketDataService, MarketDataRepository]
})
export class MarketDataModule {}
