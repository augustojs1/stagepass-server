import { PreSignedResponse } from './models';

export abstract class ICloudStorageService {
  abstract createPresignedUploadUrl(
    key: string,
    expiresIn: number,
    contentType: string,
  ): Promise<PreSignedResponse>;
  abstract remove(key: string): Promise<void>;
}
