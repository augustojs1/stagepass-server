import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { configuration } from '@/infra/config/configuration';
import { JwtPayload } from '../models';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['x-refresh-token'] || null;
        },
      ]),
      secretOrKey: configuration().jwt.refresh_secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req?.cookies?.['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const userId = payload.sub;

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
