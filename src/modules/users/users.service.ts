import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from './users.repository';
import { SignUpLocalDto } from '../auth/dtos';
import { UserEntity } from './models';
import { UserWithProfile } from './models/user-with-profile.model';
import { R2StorageService } from '@/infra/storage';
import { UsersProfileEntity } from './models/users-profile-entity.model';
import { AvatarUploadPreSignDto, UpdateAvatarSuccessDto } from './dtos';
import { PreSignedResponse } from '@/infra/storage/models';
import { UserStoragePathProvider } from './providers';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly r2StorageService: R2StorageService,
    private readonly userStoragePathProvider: UserStoragePathProvider,
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

  async createAvatarUploadPresignUrl(
    id: string,
    avatarUploadPresignDto: AvatarUploadPreSignDto,
  ): Promise<PreSignedResponse> {
    const path: string = this.userStoragePathProvider.generateAvatarKey(id);

    const user = await this.findWithProfileById(id);

    if (user.users_profile.avatar_url) {
      this.r2StorageService.removeObject(user.users_profile.avatar_url);
    }

    return await this.r2StorageService.createPresignedUploadUrl(
      `${path}/${avatarUploadPresignDto.filename}`,
      300,
      avatarUploadPresignDto.mimetype,
    );
  }

  async updateAvatar(
    id: string,
    avatarKey: string,
  ): Promise<UpdateAvatarSuccessDto> {
    await this.r2StorageService.getObject(avatarKey);

    const avatarUrl = this.userStoragePathProvider.generateAvatarUrl(avatarKey);

    const user = await this.findWithProfileById(id);

    await this.usersRepository.updateUserProfileById(user.user.id, {
      avatar_url: avatarUrl,
    });

    return {
      avatar_url: avatarUrl,
    };
  }
}
