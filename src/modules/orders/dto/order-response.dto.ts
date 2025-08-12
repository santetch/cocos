import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entity/order.entity';

export class OrderResponseDTO {
  @ApiProperty({ example: 123 }) id!: number;

  @ApiProperty({ enum: ['NEW','FILLED','REJECTED','CANCELLED'] }) status!: OrderStatus;

  @ApiProperty({ example: null, nullable: true }) reason!: string | null;
}
