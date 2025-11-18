import { Controller, Get, Post, Body, Param, UsePipes } from '@nestjs/common';

import { EventsService } from './events.service';
import { CreateEventDto, createEventDtoSchema } from './dto/create-event.dto';
import { ZodValidationPipe } from '../shared/pipes';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createEventDtoSchema))
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }
}
