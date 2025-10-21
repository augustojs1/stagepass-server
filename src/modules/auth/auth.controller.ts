import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { ZodValidationPipe } from '../shared/pipes';
import {
  signInLocalDtoSchema,
  SignUpLocalDto,
  signUpLocalDtoSchema,
} from './dtos';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/sign-up')
  @UsePipes(new ZodValidationPipe(signUpLocalDtoSchema))
  async signUpLocal(@Body() signUpLocalDto: SignUpLocalDto) {
    await this.authService.signUpLocal(signUpLocalDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/local/sign-in')
  @UsePipes(new ZodValidationPipe(signInLocalDtoSchema))
  async signInLocal(@Request() req): Promise<void> {
    console.log('user::', req.user);

    return req.user;
  }
}
