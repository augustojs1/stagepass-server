import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [DrizzleModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
