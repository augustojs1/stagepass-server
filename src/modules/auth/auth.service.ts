import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { SignUpLocalDto, UserCreatedAndTokensDto } from './dtos';
import { HashProvider } from './providers';
import { AuthTokens, JwtPayload } from './models';
import { UsersMapper } from '../users/mappers/users.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersMapper: UsersMapper,
  ) {}

  async signUpLocal(
    signUpLocalDto: SignUpLocalDto,
  ): Promise<UserCreatedAndTokensDto> {
    const user = await this.usersService.findByEmail(signUpLocalDto.email);

    if (user) {
      throw new ConflictException('User with this email already exists!');
    }

    const hashedPassword = await this.hashProvider.hashData(
      signUpLocalDto.password,
    );

    const userCreated = await this.usersService.create({
      ...signUpLocalDto,
      password: hashedPassword,
    });

    const userSignedIn = await this.signInLocal(userCreated.id);

    return userSignedIn;
  }

  async signInLocal(userId: string): Promise<UserCreatedAndTokensDto> {
    const { access_token, refresh_token } = await this.generateTokens(userId);

    const hashedRefreshToken = await this.hashProvider.hashData(refresh_token);

    await this.usersService.updateById(userId, {
      refresh_token: hashedRefreshToken,
    });

    const user = await this.usersMapper.usersUsersProfileToUserTokens(
      await this.usersService.findWithProfileById(userId),
    );

    return {
      user: user,
      tokens: {
        access_token,
        refresh_token,
      },
    };
  }

  async signOutLocal(userId: string): Promise<void> {
    await this.usersService.updateById(userId, { refresh_token: null });
  }

  async validateUser(email: string, password: string): Promise<{ id: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User does not exists!');
    }

    const isPasswordMatch = await this.hashProvider.compare(
      password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return {
      id: user.id,
    };
  }

  async refreshToken(userId: string): Promise<AuthTokens> {
    const { access_token, refresh_token } = await this.generateTokens(userId);

    const hashedRefreshToken = await this.hashProvider.hashData(refresh_token);

    await this.usersService.updateById(userId, {
      refresh_token: hashedRefreshToken,
    });

    return {
      id: userId,
      access_token,
      refresh_token,
    };
  }

  async generateTokens(user_id: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user_id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<any>('jwt.refresh_expiresIn'),
        secret: this.configService.get<any>('jwt.refresh_secret'),
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ id: string }> {
    const user = await this.usersService.findById(userId);

    if (!user.refresh_token) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    const refreshTokenMatches = await this.hashProvider.compare(
      refreshToken,
      user.refresh_token,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    return {
      id: user.id,
    };
  }
}
