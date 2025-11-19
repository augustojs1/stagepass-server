import { Injectable } from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMapper: EventsMapper,
  ) {}

  async create(createEventDto: CreateEventDto) {
    // check if event category exists
    // check if same name event exists
    // check if end date is after start date
    // get latitude and longitude for location via address zipcode
    // upload banner image
    // upload event gallery images
    // create event tickets
    // treat price in cents
    // create event

    const event = await this.eventsRepository.create(createEventDto);

    await this.eventsRepository.createEventTickets(
      this.eventsMapper.eventTicketDtoToCreateEventTicketData(
        event.id,
        createEventDto.event_tickets,
      ),
    );
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }
}
