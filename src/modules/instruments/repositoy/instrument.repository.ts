import { InjectRepository } from '@nestjs/typeorm';
import { Instrument } from '../entity/instrument.entity';
import { DataSource, ILike, In, Repository } from 'typeorm';

export class InstrumentsRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Instrument) private repository: Repository<Instrument>
  ) {}

  async find(query: string, page: number, pageSize: number) {
    const where = query ? [{ ticker: ILike(`%${query}%`) }, { name: ILike(`%${query}%`) }] : undefined;

    const [rows] = await this.repository.findAndCount({
      where,
      order: { ticker: 'ASC' },
      take: pageSize,
      skip: (page - 1) * pageSize
    });

    return rows;
  }

  async findByIds(ids: any[]): Promise<Instrument[]> {
    return await this.repository.findBy({
      id: In(ids)
    });
  }

  async getPricesFor(instrumentIds: number[]): Promise<any[]> {
    return await this.dataSource.query(
      `
      SELECT DISTINCT ON (md."instrumentId")
             md."instrumentId",
             md.close::numeric(18,4) AS close,
             md."previousClose"::numeric(18,4) AS "previousClose"
      FROM marketdata md
      WHERE md."instrumentId" = ANY($1)
      ORDER BY md."instrumentId", md."datetime" DESC
    `,
      [instrumentIds]
    );
  }
}
