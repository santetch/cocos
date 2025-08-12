import { DataSource } from 'typeorm';
import { databaseConfig } from '~src/config/postgres.db.config.provider';

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
  migrations: ['src/common/migrations/*{.ts,.js}']
});

export default migrationDataSource;
