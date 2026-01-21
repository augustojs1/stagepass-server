import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { UsersMapper } from './mappers/users.mapper';
import { UserWithProfile } from './models/user-with-profile.model';
import {
  AvatarUploadDto,
  avatarUploadDtoSchema,
  AvatarUploadPreSignDto,
  UpdateAvatarSuccessDto,
} from './dtos';
import { PreSignedResponse } from '@/infra/storage/models';
import { uploadPresignPayloadSchema } from '@/infra/storage/models/upload-pre-sign-payload';
import { ZodValidationPipe } from '../shared/pipes';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersMapper: UsersMapper,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Req() req): Promise<UserWithProfile> {
    const user = await this.usersService.findWithProfileById(req.user.sub);

    return await this.usersMapper.usersUsersProfileToUserTokens(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/me/avatar/pre-sign')
  async uploadAvatarPreSign(
    @Req() req,
    @Body(new ZodValidationPipe(uploadPresignPayloadSchema))
    uploadAvatarPresignDto: AvatarUploadPreSignDto,
  ): Promise<PreSignedResponse> {
    return await this.usersService.createAvatarUploadPresignUrl(
      req.user.sub,
      uploadAvatarPresignDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/avatar')
  async uploadAvatar(
    @Req() req,
    @Body(new ZodValidationPipe(avatarUploadDtoSchema))
    avatarUploadDto: AvatarUploadDto,
  ): Promise<UpdateAvatarSuccessDto> {
    return await this.usersService.updateAvatar(
      req.user.sub,
      avatarUploadDto.avatar_key,
    );
  }
}
