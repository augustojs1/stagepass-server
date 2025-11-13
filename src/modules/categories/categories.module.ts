import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, JwtService],
  imports: [UsersModule],
})
export class CategoriesModule {}
