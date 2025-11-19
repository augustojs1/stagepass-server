import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';
import { CategoriesService } from '../categories/categories.service';
import { SlugProvider, DateProvider } from '@/modules/shared/providers';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMapper: EventsMapper,
    private readonly categoriesService: CategoriesService,
    private readonly slugProvider: SlugProvider,
    private readonly dateProvider: DateProvider,
  ) {}

  async create(user_id: string, createEventDto: CreateEventDto) {
    // check if event category exists
    const category = await this.categoriesService.findOneElseThrow(
      createEventDto.event_category_id,
    );

    // check if same name event exists
    const existentEvent = await this.eventsRepository.findByName(
      createEventDto.name,
    );

    if (existentEvent) {
      throw new ConflictException('Event name already in use!');
    }

    // check if end date is after start date
    const isStartsAtBeforeEndsAt = this.dateProvider.isAfter(
      createEventDto.starts_at,
      createEventDto.ends_at,
    );

    if (!isStartsAtBeforeEndsAt) {
      throw new BadRequestException(
        'Starts at date should not be before ends at date.',
      );
    }

    // create slug
    const slug = this.slugProvider.slugify(createEventDto.name);

    // get latitude and longitude for location via address zipcode
    // upload banner image
    // upload event gallery images
    // treat price in cents
    // create event
    // create event tickets

    // const event = await this.eventsRepository.create({
    //   ...createEventDto,
    // });

    // await this.eventsRepository.createEventTickets(
    //   this.eventsMapper.eventTicketDtoToCreateEventTicketData(
    //     event.id,
    //     createEventDto.event_tickets,
    //   ),
    // );
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }
}
