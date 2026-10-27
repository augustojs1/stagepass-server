import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserStoragePathProvider {
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.publicUrl = this.configService.get<string>('r2.public_url');
  }

  generateAvatarKey(user_id: string): string {
    return `user_${user_id}/avatar`;
  }

  generateAvatarUrl(avatar_key: string): string {
    return `${this.publicUrl}/${avatar_key}`;
  }
}
