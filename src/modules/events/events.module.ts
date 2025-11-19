import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventsMapper],
})
export class EventsModule {}
