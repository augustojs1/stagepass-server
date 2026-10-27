import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
  UnprocessableEntityException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ICloudStorageService } from '@/infra/storage';
import { PreSignedResponse } from '@/infra/storage/models';

@Injectable()
export class S3StorageService implements ICloudStorageService {
  private readonly logger = new Logger(S3StorageService.name);

  private readonly s3Client: S3Client;
  private readonly bucket: string;

  private readonly MAX_OBJECT_SIZE_IN_BYTES = 7 * 1024 * 1024;

  private readonly VALID_OBJECT_CONTENT_TYPES: string[] = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/webp',
  ];

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('aws.region'),
    });

    this.bucket = this.configService.getOrThrow<string>('aws.s3.bucket');
  }

  async createPresignedUploadUrl(
    key: string,
    expiresIn: number = 300,
    contentType: string,
  ): Promise<PreSignedResponse> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Successfully created Pre-Signed URL for ${key}`);

      return {
        key,
        uploadUrl,
        publicUrl: this.configService.getOrThrow<string>('aws.s3.public_url'),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate pre-signed URL for ${key}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        `Failed to generate pre-signed URL for ${key}`,
      );
    }
  }

  async getObject(key: string): Promise<void> {
    try {
      const object = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      await this.validateObjectImageFile(key, object);
    } catch (err: any) {
      const status = err?.$metadata?.httpStatusCode;

      if (err?.name === 'NotFound' || status === 404) {
        this.logger.error(`File not found in S3: ${key}`);

        throw new BadRequestException(`File not found in S3: ${key}`);
      }

      if (err instanceof HttpException) {
        throw err;
      }

      this.logger.error(
        `Failed to verify file in S3: ${key}`,
        err instanceof Error ? err.stack : String(err),
      );

      throw new InternalServerErrorException(
        `Failed to verify file in S3: ${key}`,
      );
    }
  }

  async removeObject(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`Successfully removed file ${key} from S3!`);
    } catch (err: any) {
      const status = err?.$metadata?.httpStatusCode;

      if (err?.name === 'NotFound' || status === 404) {
        this.logger.error(`File not found in S3: ${key}`);

        throw new BadRequestException(`File not found in S3: ${key}`);
      }

      this.logger.error(
        `Failed to remove file from S3: ${key}`,
        err instanceof Error ? err.stack : String(err),
      );

      throw new InternalServerErrorException(
        `Failed to remove file from S3: ${key}`,
      );
    }
  }

  async validateObjectImageFile(
    key: string,
    object: HeadObjectCommandOutput,
  ): Promise<void> {
    if (
      !object.ContentType ||
      !this.VALID_OBJECT_CONTENT_TYPES.includes(object.ContentType)
    ) {
      await this.removeObject(key);

      this.logger.error(
        `Invalid content type object ${key} of content type ${object.ContentType}`,
      );

      throw new UnprocessableEntityException(
        'Invalid object content type! Object should be an image file!',
      );
    }

    if (
      object.ContentLength === undefined ||
      object.ContentLength > this.MAX_OBJECT_SIZE_IN_BYTES
    ) {
      await this.removeObject(key);

      this.logger.error(
        `Invalid content length object ${key} of content length ${object.ContentLength}`,
      );

      throw new UnprocessableEntityException(
        `Object shouldn't surpass the max content length of ${this.MAX_OBJECT_SIZE_IN_BYTES} bytes!`,
      );
    }
  }
}
