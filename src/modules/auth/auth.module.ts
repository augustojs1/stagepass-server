import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { configuration } from '@/infra/config/configuration';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { HashProvider } from './providers';
import { LocalStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: configuration().jwt.secret,
      signOptions: {
        expiresIn: configuration().jwt.expiresIn as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, HashProvider, LocalStrategy, JwtStrategy],
  exports: [],
})
export class AuthModule {}
