import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

dotenv.config();

interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: unknown[];
  synchronize: boolean;
  logging: string;
}

const databaseConfig: DatabaseConfig = {
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'cocosuser',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'cocosdb',
  entities: ['dist/**/*.entity.js'],
  synchronize: Boolean(process.env.DB_SYNC) || false,
  logging: 'all'
};

function getRepositoryConfig(config?: DatabaseConfig): TypeOrmModuleOptions {
  const defaultConfig: TypeOrmModuleOptions = databaseConfig as TypeOrmModuleOptions;

  console.log('Connecting to database:', databaseConfig.database);

  if (config) {
    return { ...defaultConfig, ...config } as TypeOrmModuleOptions;
  }

  return defaultConfig;
}

const dataSource = new DataSource(databaseConfig as DataSourceOptions);

export { databaseConfig, DatabaseConfig, getRepositoryConfig, dataSource };
