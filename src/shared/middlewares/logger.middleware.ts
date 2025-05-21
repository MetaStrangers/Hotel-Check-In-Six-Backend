import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppLogger } from '../customs';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new AppLogger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const ipAddress = req?.headers?.['x-forwarded-for'];
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const elapsedTime = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${ipAddress || ''} - ${elapsedTime / 1000} sec`,
      );
    });

    next();
  }
}
