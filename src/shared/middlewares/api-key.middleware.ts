import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Company } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import { AppLogger } from '../customs';

@Injectable()
export class ApiKeyAuthMiddleware implements NestMiddleware {
  private readonly companyRepository: Repository<Company>;
  protected readonly logger = new AppLogger(this.constructor.name);
  constructor(private readonly dataSource: DataSource) {
    this.companyRepository = this.dataSource.getRepository(Company);
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const api_key: string = (req?.headers?.['x-api-key'] as string)?.trim();
      if (!api_key) {
        this.throwUnauthorized('Unauthorized');
      }

      const company = await this.companyRepository.findOne({
        select: ['id'],
        where: { api_key },
      });

      if (!company) {
        this.throwUnauthorized('Unauthorized');
      }

      req['company'] = { id: company?.id };
      next();
    } catch (error) {
      this.logger.error('Authentication error', error.stack);
      if (error instanceof HttpException) throw error;
      this.throwUnauthorized('An unexpected error occurred');
    }
  }

  private throwUnauthorized(message: string): never {
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }
}
