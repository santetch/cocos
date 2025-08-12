import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from '~src/common/middleware/logger.middleware';
import { HealthModule } from './health/health.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { OrdersModule } from './orders/orders.module';
import { MarketDataModule } from './marketdata/marketdata.module';
import { PorfolioModule } from './porfolio/portfolio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryConfig } from '~src/config/postgres.db.config.provider';


@Module({
  imports: [
    HealthModule,
    TypeOrmModule.forRoot(getRepositoryConfig()),
    InstrumentsModule,
    OrdersModule,
    MarketDataModule,
    PorfolioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
