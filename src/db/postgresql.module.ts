/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: configService.get('DB_TYPE') as any,
        host: configService.get('DB_HOST') as any,
        port: configService.get('DB_PORT') as any,
        username: configService.get('DB_USERNAME') as any,
        password: configService.get('DB_PASSWORD') as any,
        database: configService.get('DB_NAME') as any,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        retryAttempts: 1,
        // ssl: true,
        autoLoadEntities: true,
        // synchronize: true,
        // logging: true,
      }),
    }),
  ],
})
export class PostgresqlModule {}
