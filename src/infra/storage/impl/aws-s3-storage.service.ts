import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ICloudStorageService } from '@/infra/storage';
import { PreSignedResponse } from '@/infra/storage/models';

@Injectable()
export class AwsS3StorageService implements ICloudStorageService {
  private readonly logger: Logger = new Logger(AwsS3StorageService.name);
  private readonly s3Client: S3Client;

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
  }

  async createPresignedUploadUrl(
    key: string,
    expiresIn: number = 300,
    contentType: string,
  ): Promise<PreSignedResponse> {
    try {
      const bucket = this.configService.get<string>('r2.bucket');

      const command = new PutObjectCommand({
        Bucket: bucket,
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
        'An error has occured while trying to upload an image',
      );
    }
  }

  async upload(file: Express.Multer.File, path: string): Promise<string> {
    this.logger.log(`Init S3 upload to path ${path}`);

    const bucket = this.configService.get<string>('aws.s3_bucket')!;
    const key = `${path}/${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
        }),
      );

      this.logger.log(`Successfully uploaded to S3 ${key}!`);

      const publicBaseUrl = this.configService.get<string>(
        'aws.public_base_url',
      );
      return publicBaseUrl ? `${publicBaseUrl}/${key}` : key;
    } catch (error) {
      this.logger.error(`Upload error: ${error}`);
      throw new InternalServerErrorException(
        'An error occurred while uploading an image',
      );
    }
  }

  async remove(key: string): Promise<void> {
    console.log('Remove file');
  }
}
