import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventsStoragePathProvider {
  private publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.publicUrl = this.configService.get<string>('r2.public_url');
  }

  generateKey(user_id: string, event_id: string, filename: string): string {
    return `user_${user_id}/event_${event_id}/${filename}`;
  }

  generateUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
