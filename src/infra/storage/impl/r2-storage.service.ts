import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ICloudStorageService } from '@/infra/storage';
import { PreSignedResponse } from '@/infra/storage/models';

@Injectable()
export class R2StorageService implements ICloudStorageService {
  private readonly logger: Logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('r2.access_key'),
        secretAccessKey: this.configService.get<string>('r2.secret_access_key'),
      },
      endpoint: this.configService.get<string>('r2.endpoint'),
      region: this.configService.get<string>('r2.region'),
      forcePathStyle: true,
    });

    this.bucket = this.configService.get<string>('r2.bucket');
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

      this.logger.log('Successfully created Pre-Signed URL');

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return {
        key,
        uploadUrl,
        publicUrl: this.configService.get<string>('r2.public_url'),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        `An error has occured while trying to generate pre-signed URL for ${key}`,
      );
    }
  }

  async assertObjectExists(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (err: any) {
      const status = err?.$metadata?.httpStatusCode;

      if (err?.name === 'NotFound' || status === 404) {
        throw new BadRequestException(`File not found in storage: ${key}`);
      }

      throw new InternalServerErrorException(
        `Failed to verify file in storage: ${key}`,
      );
    }
  }

  async remove(key: string): Promise<void> {
    console.log(`Remove file ${key}`);
  }
}
