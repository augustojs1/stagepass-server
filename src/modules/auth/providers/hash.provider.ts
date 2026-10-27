import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class HashProvider {
  public async hashData(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  public async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }
}
