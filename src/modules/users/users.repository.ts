import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import { SignUpLocalDto } from '../auth/dtos';
import { UserEntity } from './models';
import { UserWithProfile } from './models/user-with-profile.model';
import { UsersUsersProfile } from './models/users-users-profile.model';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async createUserAndProfileTrx(
    signUpLocal: SignUpLocalDto,
  ): Promise<UserWithProfile> {
    return this.drizzle.transaction(async (trx) => {
      await trx.insert(schema.users).values({
        first_name: signUpLocal.first_name,
        last_name: signUpLocal.last_name,
        email: signUpLocal.email,
        password: signUpLocal.password,
      });

      const usersResult = await trx
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, signUpLocal.email));

      const user = usersResult[0];

      await trx.insert(schema.users_profile).values({
        user_id: user.id,
        avatar_url: null,
        phone_number: null,
      });

      delete user.password;
      delete user.refresh_token;

      return {
        ...user,
        avatar_url: null,
        phone_number: null,
      };
    });
  }

  async findById(user_id: string): Promise<UserEntity | null> {
    const user = await this.drizzle
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user_id));

    return user[0];
  }

  async findWithProfileById(
    user_id: string,
  ): Promise<UsersUsersProfile | null> {
    const user = await this.drizzle
      .select()
      .from(schema.users)
      .innerJoin(
        schema.users_profile,
        eq(schema.users.id, schema.users_profile.user_id),
      )
      .where(eq(schema.users_profile.user_id, user_id));

    return {
      user: user[0].users,
      users_profile: user[0].users_profile,
    };
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
