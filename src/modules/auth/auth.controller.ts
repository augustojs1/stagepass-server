import { Controller, Post } from '@nestjs/common';

import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/local/sign-in')
  async signInLocal(): Promise<void> {
    await this.usersService.create();
  }
}
