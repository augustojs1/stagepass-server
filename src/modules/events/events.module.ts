import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventsMapper, JwtService],
  imports: [CategoriesModule],
})
export class EventsModule {}
