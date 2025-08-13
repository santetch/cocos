import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from './entity/instrument.entity';
import { InstrumentsService } from './service/instrument.service';
import { InstrumentsController } from './controller/instruments.controller';
import { InstrumentsRepository } from './repositoy/instrument.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Instrument])],
  providers: [InstrumentsService, InstrumentsRepository],
  controllers: [InstrumentsController],
  exports: [InstrumentsService, InstrumentsRepository]
})
export class InstrumentsModule {}
