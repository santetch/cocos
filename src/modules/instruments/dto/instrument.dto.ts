import { ApiProperty } from '@nestjs/swagger';

export class InstrumentDTO {
  @ApiProperty({ example: 10 }) id: number;

  @ApiProperty({ example: 'GGAL' }) ticker: string;

  @ApiProperty({ example: 'Grupo Financiero Galicia' }) name: string;

  @ApiProperty({ example: 'ACCION', enum: ['ACCION', 'BONO', 'ETF', 'CEDEAR', 'MONEDA'] })
  type: string;
}
