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
import { IStorageService } from '@/infra/storage';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMapper: EventsMapper,
    private readonly categoriesService: CategoriesService,
    private readonly slugProvider: SlugProvider,
    private readonly dateProvider: DateProvider,
    private readonly storageService: IStorageService,
  ) {}

  async create(
    user_id: string,
    createEventDto: CreateEventDto,
    files: {
      banner_image?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
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
    const bannerImageUrl = await this.storageService.upload(
      files.banner_image[0],
      `user_${user_id}/slug/banner`,
    );

    // create event
    const event = await this.eventsRepository.create({
      ...createEventDto,
      organizer_id: user_id,
      banner_url: bannerImageUrl,
      slug: slug,
      location: { x: -90.9, y: 18.7 },
      starts_at: new Date(createEventDto.starts_at),
      ends_at: new Date(createEventDto.ends_at),
    });

    // upload event gallery images
    await this.createEventImages(user_id, event.id, files.images);

    // create event tickets
    // treat price in cents
    await this.eventsRepository.createEventTickets(
      this.eventsMapper.eventTicketDtoToCreateEventTicketData(
        event.id,
        createEventDto.event_tickets,
      ),
    );
  }

  async createEventImages(
    user_id: string,
    event_id: string,
    event_images: Express.Multer.File[],
  ): Promise<void> {
    for (const image of event_images) {
      const imageUrl = await this.storageService.upload(
        image,
        `user_${user_id}/event_${event_id}/images`,
      );

      await this.eventsRepository.createEventImage({
        event_id: event_id,
        url: imageUrl,
        mimetype: image.mimetype,
        name: image.originalname,
        size: image.size,
      });
    }
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }
}
