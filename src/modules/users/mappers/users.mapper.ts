import { UsersUsersProfile } from '../models/users-users-profile.model';
import { UserWithProfile } from '../models/user-with-profile.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersMapper {
  async usersUsersProfileToUserTokens(
    user: UsersUsersProfile,
  ): Promise<UserWithProfile> {
    delete user.user.password;
    delete user.user.refresh_token;
    delete user.users_profile.id;
    delete user.users_profile.created_at;
    delete user.users_profile.updated_at;

    return {
      id: user.user.id,
      username: user.user.username,
      email: user.user.email,
      first_name: user.user.first_name,
      last_name: user.user.last_name,
      avatar_url: user.users_profile.avatar_url,
      is_admin: user.user.is_admin,
      phone_number: user.users_profile.phone_number,
      updated_at: user.user.updated_at,
      created_at: user.user.created_at,
    };
  }
}
