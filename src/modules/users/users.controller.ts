import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { PartialUserEntity } from './models';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Req() req): Promise<PartialUserEntity> {
    const user = await this.usersService.findById(req.user.id);

    delete user.is_admin;
    delete user.password;

    return user;
  }
}
