import { Controller, Get, HttpCode, Logger, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PortfolioService } from '../service/portfolio.service';
import { PortfolioDTO } from '../dto/portfolio.dto';

@ApiTags('Portfolio')
@Controller('/portfolio')
export class PortfolioController {
  constructor(private readonly service: PortfolioService) {}

  private readonly logger = new Logger(PortfolioController.name);

  @Get(':id')
  @HttpCode(200)
  @ApiResponse({ status: 404, description: 'Portfolio not found' })
  @ApiResponse({ status: 200, description: 'Portfolio found successfully' })
  async getById(@Param('id') id: number): Promise<PortfolioDTO> {
    try {
      const portfolio = await this.service.getPortfolio(id);

      this.logger.log('Portfolio retrieved:', portfolio);

      return portfolio;
    } catch (error) {
      this.logger.error(`Error retrieving portfolio for user ${id}`, error);

      throw error;
    }
  }
}
