import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { SignUpLocalDto } from './dtos';
import { HashProvider } from './providers';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
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
  }

  async signInLocal(email: string, password: string) {
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
}
