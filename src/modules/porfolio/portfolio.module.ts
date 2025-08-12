import { Module } from '@nestjs/common';

import { PortfolioService } from './service/portfolio.service';
import { PortfolioController } from './controller/portfolio.controller';
import { MarketDataModule } from '../marketdata/marketdata.module';
import { InstrumentsModule } from '../instruments/instruments.module';
import { PortfolioRepository } from './repository/portfolio.repository';

@Module({
  imports: [MarketDataModule, InstrumentsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioRepository],
})
export class PorfolioModule {}
