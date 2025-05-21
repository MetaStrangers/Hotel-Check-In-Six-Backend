import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import compression from 'compression';
import { HttpExceptionFilter } from './shared/filters';
import helmet from 'helmet';
import { InvalidRequestValidator } from './shared/pipes';

const logger = new Logger('MAIN');
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });
  app.use(
    helmet({
      hidePoweredBy: true,
    }),
  );
  app.useGlobalPipes(new InvalidRequestValidator());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  await app.init();
  return app;
}

async function start() {
  try {
    const app = await bootstrap();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Server is running on port ${port}`);
  } catch (error) {
    logger.error(`❌ Error starting server: ${error.message}`);
    process.exit(1);
  }
}

start();
