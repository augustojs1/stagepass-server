export abstract class IStorageService {
  abstract upload(file: Express.Multer.File, path: string): Promise<string>;
  abstract remove(key: string): Promise<void>;
}
