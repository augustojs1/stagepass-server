import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';
import { CategoriesModule } from '../categories/categories.module';
import { SlugProvider } from '../shared/providers';
import { DateProvider } from '../shared/providers/date.provider';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    EventsMapper,
    JwtService,
    SlugProvider,
    DateProvider,
  ],
  imports: [CategoriesModule],
})
export class EventsModule {}
