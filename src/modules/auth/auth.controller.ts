import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { ZodValidationPipe } from '../shared/pipes';
import { SignUpLocalDto, signUpLocalDtoSchema } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/local/sign-up')
  @UsePipes(new ZodValidationPipe(signUpLocalDtoSchema))
  async signUpLocal(@Body() signUpLocalDto: SignUpLocalDto): Promise<void> {
    console.log('signUpLocalDto::', signUpLocalDto);
  }

  @Post('/local/sign-in')
  async signInLocal(): Promise<void> {}
}
