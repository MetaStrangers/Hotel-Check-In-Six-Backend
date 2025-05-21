import { Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';

const asyncLocalStorage = new AsyncLocalStorage<{ requestId: string }>();

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Optional: define custom colors
winston.addColors({
  error: 'bold red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  verbose: 'cyan',
});

const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [
    // Colorized console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
    }),

    // Error log file transport
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

export class AppLogger extends Logger {
  constructor(context?: string) {
    super(context);
  }

  static runWithRequestId<T>(fn: () => T): T {
    const requestId = randomUUID();
    return asyncLocalStorage.run({ requestId }, fn);
  }

  private get requestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  }

  private formatMessage(message: any): string {
    const formatted =
      typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);
    const requestId = this.requestId;
    return requestId
      ? `[${requestId}]-[${this.context}] ${formatted}`
      : `[${this.context}] ${formatted}`;
  }

  override log(message: any) {
    winstonLogger.info(this.formatMessage(message));
  }

  override error(message: any, trace?: string) {
    winstonLogger.error(this.formatMessage(message) + (trace ? `\nTrace: ${trace}` : ''));
  }

  override warn(message: any) {
    winstonLogger.warn(this.formatMessage(message));
  }

  override debug(message: any) {
    winstonLogger.debug(this.formatMessage(message));
  }

  override verbose(message: any) {
    winstonLogger.verbose(this.formatMessage(message));
  }
}
