import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AppLogger } from '../customs';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('HttpException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const ipAddress = request?.headers?.['x-forwarded-for'];

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status || 500,
      ...(typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as any)?.message
          ? exceptionResponse
          : { message: 'INTERNAL SERVER ERROR' }),
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    // Log the exception details
    this.logger.error(
      `${ipAddress || ''} : ${request?.method} ${request?.url} - ${JSON.stringify(errorResponse)}`,
    );

    // Send the structured error response
    response.status(status).json(errorResponse);
  }
}
