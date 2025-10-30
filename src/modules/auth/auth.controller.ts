import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';

import { ZodValidationPipe } from '../shared/pipes';
import {
  SignInLocalDto,
  signInLocalDtoSchema,
  SignUpLocalDto,
  signUpLocalDtoSchema,
} from './dtos';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { configuration } from '@/infra/config/configuration';
import { UserProfileDto } from '@/modules/users/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/sign-up')
  @UsePipes(new ZodValidationPipe(signUpLocalDtoSchema))
  async signUpLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() signUpLocalDto: SignUpLocalDto,
  ): Promise<UserProfileDto> {
    const userCreatedAndTokens =
      await this.authService.signUpLocal(signUpLocalDto);

    res.cookie('x-access-token', userCreatedAndTokens.tokens.access_token, {
      // httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      maxAge: Number(configuration().jwt.expiresInMs),
    });

    res.cookie('x-refresh-token', userCreatedAndTokens.tokens.refresh_token, {
      // httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      maxAge: Number(configuration().jwt.refresh_expiresInMs),
    });

    return userCreatedAndTokens.user;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/sign-in')
  @UsePipes(new ZodValidationPipe(signInLocalDtoSchema))
  async signInLocal(
    @Res({ passthrough: true }) res: Response,
    @Body() body: SignInLocalDto,
  ): Promise<UserProfileDto> {
    const userLoggedIn = await this.authService.signInLocal(body);

    res.cookie('x-access-token', userLoggedIn.tokens.access_token, {
      // httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      maxAge: Number(configuration().jwt.expiresInMs),
    });

    res.cookie('x-refresh-token', userLoggedIn.tokens.refresh_token, {
      // httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      maxAge: Number(configuration().jwt.refresh_expiresInMs),
    });

    return userLoggedIn.user;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('/local/refresh')
  async refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/local/sign-out')
  async signOutLocal(@Req() req) {
    await this.authService.signOutLocal(req.user.id);
  }
}
