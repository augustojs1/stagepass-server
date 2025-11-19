import { Injectable } from '@nestjs/common';
import * as slugify from 'slugify';

@Injectable()
export class SlugProvider {
  public slugify(payload: string): string {
    return slugify.default(payload, {
      trim: true,
      lower: true,
    });
  }
}
