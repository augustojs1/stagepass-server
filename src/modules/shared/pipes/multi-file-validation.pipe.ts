import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

interface MultiFileValidationOptions {
  maxSize?: number;
  fileTypes?: RegExp[];
}

@Injectable()
export class MultiFileValidationPipe implements PipeTransform {
  constructor(private readonly options: MultiFileValidationOptions = {}) {}

  transform(value: Record<string, Express.Multer.File[]>) {
    if (!value || typeof value !== 'object') return value;

    const { maxSize, fileTypes } = this.options;

    for (const fieldName in value) {
      const files = value[fieldName];

      for (const file of files) {
        if (fileTypes && fileTypes.length > 0) {
          const isValidType = fileTypes.some((regex) =>
            regex.test(file.mimetype),
          );

          if (!isValidType) {
            throw new BadRequestException({
              message: `Invalid file type for field "${fieldName}"`,
              file: file.originalname,
              mimetype: file.mimetype,
              expected: fileTypes.map((r) => r.toString()),
            });
          }
        }

        if (maxSize && file.size > maxSize) {
          throw new BadRequestException({
            message: `File too large for field "${fieldName}"`,
            file: file.originalname,
            size: file.size,
            maxAllowed: maxSize,
          });
        }
      }
    }

    return value;
  }
}
