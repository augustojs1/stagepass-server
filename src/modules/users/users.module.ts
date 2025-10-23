import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { UsersMapper } from './mappers/users.mapper';

@Module({
  controllers: [UsersController],
  imports: [DrizzleModule],
  providers: [UsersService, UsersRepository, UsersMapper],
  exports: [UsersService, UsersMapper],
})
export class UsersModule {}
