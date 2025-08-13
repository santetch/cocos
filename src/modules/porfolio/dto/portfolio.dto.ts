import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { PositionDTO } from './position.dto';

export class PortfolioDTO {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '12345.67', description: 'Available cash in ARS' })
  cash: string;

  @ApiProperty({ example: '45678.90', description: 'Total portfolio value (cash + market value of positions)' })
  totalValue: string;

  @ApiProperty({ type: [PositionDTO] })
  positions: PositionDTO[];
}
