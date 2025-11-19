import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';

import { EventsService } from './events.service';
import { CreateEventDto, createEventDtoSchema } from './dto/create-event.dto';
import { ZodValidationPipe } from '../shared/pipes';
import { JwtAuthGuard } from '../auth/guards';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(createEventDtoSchema))
  async create(@Req() req, @Body() createEventDto: CreateEventDto) {
    return await this.eventsService.create(req.user.sub, createEventDto);
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
