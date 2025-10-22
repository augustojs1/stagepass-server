import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import { SignUpLocalDto } from '../auth/dtos';
import { UserEntity } from './models';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(signUpLocal: SignUpLocalDto): Promise<void> {
    await this.drizzle.insert(schema.users).values({
      username: signUpLocal.username,
      first_name: signUpLocal.first_name,
      last_name: signUpLocal.last_name,
      email: signUpLocal.email,
      password: signUpLocal.password,
    });
  }

  async findById(user_id: string): Promise<UserEntity | null> {
    const user = await this.drizzle
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user_id));

    return user[0];
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.drizzle
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    return user[0];
  }

  async updateById(user_id: string, userData: Partial<UserEntity>) {
    await this.drizzle
      .update(schema.users)
      .set(userData as any)
      .where(eq(schema.users.id, user_id));
  }
}
