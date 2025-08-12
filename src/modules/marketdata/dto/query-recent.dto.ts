import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class QueryRecentDTO {
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  instrumentId!: number;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 500, default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  limit?: number = 50;
}
