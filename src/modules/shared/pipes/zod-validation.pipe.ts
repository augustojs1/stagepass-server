import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, z } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      const parsedZodError = z.treeifyError(error);

      throw new BadRequestException({
        message: 'Validation error',
        error: 'Bad Request',
        statusCode: 400,
        errors: parsedZodError,
      });
    }
  }
}
