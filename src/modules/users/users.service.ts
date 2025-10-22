import { Injectable, NotFoundException } from '@nestjs/common';

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
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('User with this id does not exists!');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await this.usersRepository.findByEmail(email);
  }

  async updateById(userId: string, userData: Partial<UserEntity>) {
    await this.findById(userId);

    await this.usersRepository.updateById(userId, userData);
  }
}
