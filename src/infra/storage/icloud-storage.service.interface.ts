import { PreSignedResponse } from './models';

export abstract class ICloudStorageService {
  abstract createPresignedUploadUrl(
    key: string,
    expiresIn: number,
    contentType: string,
  ): Promise<PreSignedResponse>;
  abstract upload(file: Express.Multer.File, path: string): Promise<string>;
  abstract remove(key: string): Promise<void>;
}
