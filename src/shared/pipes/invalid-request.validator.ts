import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { InvalidRequestException } from '../errors';
import { AppLogger } from '../customs';

@Injectable()
export class InvalidRequestValidator implements PipeTransform<any> {
  private readonly logger = new AppLogger(InvalidRequestValidator.name);

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype, type, data } = metadata;

    // If metatype is not present or is primitive, skip validation
    if (!metatype || this.isPrimitive(metatype)) {
      return value;
    }

    // If body or query is undefined/null, default to empty object
    if ((type === 'body' || type === 'query') && value == null) {
      value = {};
    }

    // Convert plain object to class instance
    const object = plainToInstance(metatype, value, {
      excludeExtraneousValues: false,
    });

    try {
      const errors = await validate(object);

      if (errors.length > 0) {
        this.logger.warn(
          `Validation failed for ${type} "${data || 'unknown'}":\n` +
            JSON.stringify(errors, null, 2),
        );
        throw new InvalidRequestException(errors);
      }
    } catch (err) {
      if (err instanceof InvalidRequestException) {
        throw err;
      }

      this.logger.error(
        `Unexpected error during validation of ${type} "${data || 'unknown'}":`,
        err.stack,
      );
      throw new InvalidRequestException([]);
    }

    // Deep clean null or undefined values
    return this.deepClean(object);
  }

  private isPrimitive(metatype: any): boolean {
    const primitives = [String, Boolean, Number, Array, Object];
    return primitives.includes(metatype);
  }

  private deepClean(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClean(item)).filter((item) => item != null);
    } else if (obj && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, val]) => {
        const cleaned = this.deepClean(val);
        if (cleaned != null) {
          acc[key] = cleaned;
        }
        return acc;
      }, {} as any);
    }
    return obj != null ? obj : undefined;
  }
}
