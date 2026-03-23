import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from '../config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD.getSecretValue(),
  database: config.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};
