import {
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { UsersMapper } from './mappers/users.mapper';
import { UserWithProfile } from './models/user-with-profile.model';

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
  @UseInterceptors(FileInterceptor('image'))
  @Post('/avatar')
  async uploadAvatar(
    @Req() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image/ })
        .addMaxSizeValidator({
          maxSize: 7_000_000, // 7 MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return await this.usersService.uploadAvatar(req.user.sub, file);
  }
}
