import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import { SignUpLocalDto } from './dtos';
import { HashProvider } from './providers';
import { JwtPayload } from './models';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
  ) {}

  async signUpLocal(signUpLocalDto: SignUpLocalDto) {
    const user = await this.usersService.findByEmail(signUpLocalDto.email);

    if (user) {
      throw new ConflictException('User with this email already exists!');
    }

    const hashedPassword = await this.hashProvider.hashData(
      signUpLocalDto.password,
    );

    await this.usersService.create({
      ...signUpLocalDto,
      password: hashedPassword,
    });

    const createdUser = await this.usersService.findByEmail(
      signUpLocalDto.email,
    );

    const token = await this.signInLocal(createdUser.id);

    return {
      id: createdUser.id,
      token,
    };
  }

  async validateUser(email: string, password: string) {
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

  async signInLocal(user_id: string) {
    const payload: JwtPayload = {
      sub: user_id,
    };

    return this.jwtService.sign(payload);
  }
}
