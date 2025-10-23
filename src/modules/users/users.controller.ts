import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';

import { UsersMapper } from './mappers/users.mapper';
import { UserWithProfile } from './models/user-with-profile.model';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersMapper: UsersMapper,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Req() req): Promise<UserWithProfile> {
    const user = await this.usersService.findWithProfileById(req.user.id);

    return await this.usersMapper.usersUsersProfileToUserTokens(user);
  }
}
