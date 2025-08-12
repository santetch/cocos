import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderSide, OrderType } from '../entity/order.entity';


export class CreateOrderDTO {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  userId!: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  instrumentId!: number;

  @ApiProperty({ enum: ['BUY','SELL','CASH_IN','CASH_OUT'] })
  @IsIn(['BUY','SELL','CASH_IN','CASH_OUT'])
  side!: OrderSide;

  @ApiProperty({ enum: ['MARKET','LIMIT'] })
  @IsIn(['MARKET','LIMIT'])
  type!: OrderType;

  @ApiPropertyOptional({ example: 100, description: 'Shares for equity ops. Mutually exclusive with amount.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ValidateIf(o => o.amount == null)
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ example: 50000, description: 'ARS amount; for BUY MARKET/LIMIT computes floor(amount/price).' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ValidateIf(o => o.size == null)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: '890.50', description: 'Required for LIMIT; ignored for MARKET.' })
  @ValidateIf(o => o.type === 'LIMIT')
  price?: string;

  @ApiPropertyOptional({ example: 'd0f1-req-123', description: 'Idempotency key (optional).' })
  @IsOptional()
  correlationId?: string;
}
