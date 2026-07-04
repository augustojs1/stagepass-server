import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { TicketsController } from './tickets.controller';
import { TicketsMapper } from './mappers/tickets.mapper';

@Module({
  controllers: [TicketsController],
  providers: [JwtService, TicketsService, TicketsRepository, TicketsMapper],
})
export class TicketsModule {}
