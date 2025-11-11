import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { SignUpLocalDto } from '../auth/dtos';
import { UserEntity } from './models';
import { UserWithProfile } from './models/user-with-profile.model';
import { IStorageService } from '@/infra/storage';
import { UsersProfileEntity } from './models/users-profile-entity.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: IStorageService,
  ) {}

  async create(signUpLocalDto: SignUpLocalDto): Promise<UserWithProfile> {
    return await this.usersRepository.createUserAndProfileTrx(signUpLocalDto);
  }

  async findByIdElseThrow(user_id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('User with this id does not exists!');
    }

    return user;
  }

  async findWithProfileById(user_id: string) {
    const user = await this.usersRepository.findWithProfileById(user_id);

    if (!user) {
      throw new NotFoundException('User with this id does not exists!');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await this.usersRepository.findByEmail(email);
  }

  async updateById(userId: string, userData: Partial<UserEntity>) {
    await this.findByIdElseThrow(userId);

    await this.usersRepository.updateById(userId, userData);
  }

  async updateUserProfileById(
    id: string,
    userData: Partial<UsersProfileEntity>,
  ) {
    await this.findByIdElseThrow(id);

    await this.usersRepository.updateUserProfileById(id, userData);
  }

  async uploadAvatar(
    id: string,
    avatar_file: Express.Multer.File,
  ): Promise<void> {
    const path: string = `user_${id}/avatar`;

    const user = await this.findWithProfileById(id);

    if (user.users_profile.avatar_url) {
      this.storageService.remove(user.users_profile.avatar_url);
    }

    const url = await this.storageService.upload(avatar_file, path);

    await this.updateUserProfileById(id, {
      avatar_url: url,
    });
  }
}
