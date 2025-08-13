import { ApiProperty } from '@nestjs/swagger';

export class PositionDTO {
  @ApiProperty({ example: 10 })
  instrumentId: number;

  @ApiProperty({ example: 'GGAL', description: 'Instrument ticker symbol' })
  ticker: string;

  @ApiProperty({ example: 'Grupo Financiero Galicia', description: 'Instrument name' })
  name: string;

  @ApiProperty({ example: '120.0000', description: 'Net shares held (string to preserve precision)' })
  shares: string;

  @ApiProperty({ example: '890.5000', description: 'Latest closing price in ARS' })
  close: string;

  @ApiProperty({ example: '870.0000', description: 'Previous closing price in ARS' })
  previousClose: string;

  @ApiProperty({ example: '106860.00', description: 'Market value in ARS (shares × close)' })
  marketValue: string;

  @ApiProperty({ example: '0.023563', description: 'Daily return percentage as decimal fraction' })
  dailyReturnPct: string;
}
