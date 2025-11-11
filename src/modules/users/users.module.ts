import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { UsersMapper } from './mappers/users.mapper';
import { DiskStorageService, IStorageService } from '@/infra/storage';

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
    {
      provide: IStorageService,
      useClass: DiskStorageService,
    },
  ],
  exports: [UsersService, UsersMapper],
})
export class UsersModule {}
