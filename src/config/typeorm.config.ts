/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
config();

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: configService.get('DB_TYPE') as any,
  host: configService.get('DB_HOST') as any,
  port: configService.get('DB_PORT') as any,
  username: configService.get('DB_USERNAME') as any,
  password: configService.get('DB_PASSWORD') as any,
  database: configService.get('DB_NAME') as any,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['src/db/migrations/*-migration.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
