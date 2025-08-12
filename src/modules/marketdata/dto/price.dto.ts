import { ApiProperty } from '@nestjs/swagger';

export class PriceDTO {
  @ApiProperty({ example: 10 }) instrumentId!: number;

  @ApiProperty({ example: '2025-08-07T20:00:00.000Z' }) datetime!: string;

  @ApiProperty({ example: '123.4500' }) open!: string;

  @ApiProperty({ example: '125.1000' }) high!: string;

  @ApiProperty({ example: '122.9000' }) low!: string;

  @ApiProperty({ example: '124.8000' }) close!: string;

  @ApiProperty({ example: '120.0000' }) previousClose!: string;
}
