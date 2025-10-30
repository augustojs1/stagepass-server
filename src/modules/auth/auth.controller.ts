import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { ZodValidationPipe } from '../shared/pipes';
import {
  SignInLocalDto,
  signInLocalDtoSchema,
  SignUpLocalDto,
  signUpLocalDtoSchema,
  UserCreatedAndTokensDto,
} from './dtos';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/sign-up')
  @UsePipes(new ZodValidationPipe(signUpLocalDtoSchema))
  async signUpLocal(
    @Body() signUpLocalDto: SignUpLocalDto,
  ): Promise<UserCreatedAndTokensDto> {
    const userCreatedAndTokens =
      await this.authService.signUpLocal(signUpLocalDto);

    return userCreatedAndTokens;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/local/sign-in')
  @UsePipes(new ZodValidationPipe(signInLocalDtoSchema))
  async signInLocal(@Body() body: SignInLocalDto): Promise<any> {
    return await this.authService.signInLocal(body);
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
