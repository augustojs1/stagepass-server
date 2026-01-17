import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { R2StorageService } from '@/infra/storage';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { UsersMapper } from './mappers/users.mapper';

@Module({
  controllers: [UsersController],
  imports: [
    DrizzleModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  providers: [
    UsersService,
    UsersRepository,
    UsersMapper,
    JwtService,
    R2StorageService,
  ],
  exports: [UsersService, UsersMapper],
})
export class UsersModule {}
