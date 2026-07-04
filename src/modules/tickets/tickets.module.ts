import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { TicketsController } from './tickets.controller';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [TicketsController],
  imports: [EventsModule],
  providers: [JwtService, TicketsService, TicketsRepository],
})
export class TicketsModule {}
