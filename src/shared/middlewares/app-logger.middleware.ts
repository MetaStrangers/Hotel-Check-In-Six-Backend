import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../customs';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    AppLogger.runWithRequestId(() => next());
  }
}
