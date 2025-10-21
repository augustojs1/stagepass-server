import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { SignUpLocalDto } from '../auth/dtos';
import { UserEntity } from './models';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(signUpLocalDto: SignUpLocalDto): Promise<void> {
    return await this.usersRepository.create(signUpLocalDto);
  }

  async findById(user_id: string): Promise<UserEntity> {
    return await this.usersRepository.findById(user_id);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findByEmail(email);
  }
}
