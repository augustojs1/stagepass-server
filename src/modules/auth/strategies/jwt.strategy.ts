import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { configuration } from '@/infra/config/configuration';
import { JwtPayload } from '../models';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configuration().jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
    };
  }
}
