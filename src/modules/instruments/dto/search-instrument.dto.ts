import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchInstrumentsDTO {
  @ApiPropertyOptional({ example: 'GGAL', description: 'Search by ticker or name (partial, case-insensitive)' })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 100, default: 25 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  @IsOptional()
  pageSize?: number = 25;
}
