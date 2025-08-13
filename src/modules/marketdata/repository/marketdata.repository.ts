import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { MarketData } from "../entity/marketdata.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class MarketDataRepository {
    constructor(
        @InjectRepository(MarketData) private readonly repository: Repository<MarketData>,
    ) { }

    async getLatestFor(instrumentId: number): Promise<MarketData | null> {
        return await this.repository.findOne({
            where: { instrumentId },
            order: { datetime: 'DESC' },
        });
    };

    async getRecentFor(instrumentId: number, limit: number): Promise<MarketData[]> {
        return await this.repository.find({
            where: { instrumentId },
            order: { datetime: 'DESC' },
            take: limit,
        });
    };
}
