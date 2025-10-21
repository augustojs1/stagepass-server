import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { SignUpLocalDto } from '../auth/dtos';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(signUpLocalDto: SignUpLocalDto): Promise<void> {
    return await this.usersRepository.create(signUpLocalDto);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
