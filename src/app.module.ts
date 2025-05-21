import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyAuthMiddleware, AppLoggerMiddleware, LoggerMiddleware } from './shared/middlewares';
import { PostgresqlModule } from './db';
import { ModuleClasses } from './config/modules.config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PostgresqlModule, ...ModuleClasses],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppLoggerMiddleware, LoggerMiddleware).forRoutes('*');
    consumer
      .apply(ApiKeyAuthMiddleware)
      .forRoutes({ path: 'veriff_sessions', method: RequestMethod.POST });
  }
}
