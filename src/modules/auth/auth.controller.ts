import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
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
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/local/sign-up')
  @UsePipes(new ZodValidationPipe(signUpLocalDtoSchema))
  async signUpLocal(@Body() signUpLocalDto: SignUpLocalDto) {
    return await this.authService.signUpLocal(signUpLocalDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/local/sign-in')
  @UsePipes(new ZodValidationPipe(signInLocalDtoSchema))
  async signInLocal(@Request() req): Promise<any> {
    return await this.authService.signInLocal(req.user.id);
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
