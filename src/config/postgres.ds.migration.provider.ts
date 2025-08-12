import { DataSource } from 'typeorm';

import { databaseConfig } from './postgres.db.config.provider';

const migrationDataSource = new DataSource({
  type: 'postgres',
  host: databaseConfig.host,
  port: Number(databaseConfig.port),
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: true,
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/common/migration/*{.ts,.js}']
});

export default migrationDataSource;
