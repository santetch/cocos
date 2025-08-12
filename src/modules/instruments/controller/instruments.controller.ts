import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SearchInstrumentsDTO } from '../dto/search-instrument.dto';
import { InstrumentDTO } from '../dto/instrument.dto';
import { InstrumentsService } from '../service/instrument.service';


@ApiTags('Instruments')
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly service: InstrumentsService) {}

  private logger: Logger = new Logger(InstrumentsController.name);

  @Get()
  @ApiOkResponse({ type: [InstrumentDTO] })
  async search(@Query() dto: SearchInstrumentsDTO): Promise<InstrumentDTO[]> {
    try {
      return await this.service.search(dto);
    } catch (error) {
      this.logger.error('Error searching instruments', error);
      
      return [];
    }
  }
}
