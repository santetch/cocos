import { Body, Controller, Get, Logger, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../service/marketdata.service';
import { PriceDTO } from '../dto/price.dto';
import { QueryRecentDTO } from '../dto/query-recent.dto';

@ApiTags('MarketData')
@Controller('marketdata')
export class MarketDataController {
  constructor(private readonly service: MarketDataService) { }

  private logger = new Logger(MarketDataController.name);

  @Get(':instrumentId/latest')
  @ApiOkResponse({ type: PriceDTO, description: 'Latest price for instrument' })
  async latest(@Param('instrumentId', ParseIntPipe) instrumentId: number): Promise<PriceDTO | null> {
    try {
      const r = await this.service.getLatestFor(instrumentId);
      return r && {
        instrumentId: r.instrumentId,
        datetime: r.datetime.toISOString(),
        open: r.open, high: r.high, low: r.low, close: r.close, previousClose: r.previousClose,
      };
    } catch (error) {
      this.logger.error(`Error fetching latest price for instrument ${instrumentId}`, error);

      return null;
    }
  }

  @Get('recent')
  @ApiOkResponse({ type: [PriceDTO], description: 'Recent candles for an instrument (DESC by datetime)' })
  async recent(@Query() q: QueryRecentDTO): Promise<PriceDTO[]> {
    try {
      const rows = await this.service.getRecentFor(q.instrumentId, q.limit);
      return rows.map(r => ({
        instrumentId: r.instrumentId,
        datetime: r.datetime.toISOString(),
        open: r.open, high: r.high, low: r.low, close: r.close, previousClose: r.previousClose,
      }));
    } catch (error) {
      this.logger.error(`Error fetching recent prices for instrument ${q.instrumentId}`, error);

      return [];
    }
  }
}
