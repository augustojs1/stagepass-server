import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AdminUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['x-access-token'];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request['user'] = payload;

      const user = await this.usersService.findByIdElseThrow(payload.sub);

      if (!user.is_admin) {
        throw new ForbiddenException();
      }

      return true;
    } catch (error) {
      console.log('AdminUserGuard error::', error);

      throw new UnauthorizedException();
    }
  }
}
