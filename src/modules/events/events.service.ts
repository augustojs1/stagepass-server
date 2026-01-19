import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { CreateEventDto } from './dto/request/create-event.dto';
import { EventsRepository } from './events.repository';
import { EventsMapper } from './mappers/events.mapper';
import { CategoriesService } from '../categories/categories.service';
import { SlugProvider, DateProvider } from '@/modules/shared/providers';
import { IStorageService, R2StorageService } from '@/infra/storage';
import { GeocoderService } from './providers';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import {
  BannerImageUploadPresignDto,
  BannerUpdateResponseDto,
  CreateEventResponseDto,
} from './dto';
import { PreSignedResponse } from '@/infra/storage/models';
import { EventsEntity } from './models';

@Injectable()
export class EventsService {
  private readonly logger: Logger = new Logger(EventsService.name);

  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMapper: EventsMapper,
    private readonly categoriesService: CategoriesService,
    private readonly slugProvider: SlugProvider,
    private readonly dateProvider: DateProvider,
    private readonly storageService: IStorageService,
    private readonly geocoderService: GeocoderService,
    private readonly r2StorageService: R2StorageService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    user_id: string,
    createEventDto: CreateEventDto,
    files: {
      banner_image?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ): Promise<CreateEventResponseDto> {
    await this.categoriesService.findOneElseThrow(
      createEventDto.event_category_id,
    );

    const existentEvent = await this.eventsRepository.findByName(
      createEventDto.name,
    );

    if (existentEvent) {
      throw new ConflictException('Event name already in use!');
    }

    const isStartsAtBeforeEndsAt = this.dateProvider.isAfter(
      createEventDto.starts_at,
      createEventDto.ends_at,
    );

    if (!isStartsAtBeforeEndsAt) {
      throw new BadRequestException(
        'Starts at date should not be before ends at date.',
      );
    }

    const slug = this.slugProvider.slugify(createEventDto.name);

    const geocodeResponse = await this.geocoderService.forwardGeocode({
      complement: createEventDto.address_number,
      street: createEventDto.address_street,
      city: createEventDto.address_city,
    });

    if (!geocodeResponse) {
      throw new BadRequestException('Invalid or non existent address!');
    }

    const bannerImageUrl = await this.storageService.upload(
      files.banner_image[0],
      `user_${user_id}/slug/banner`,
    );

    const createdEvent = await this.drizzle.transaction(async (trx) => {
      const result = await trx
        .insert(schema.events)
        .values({
          ...createEventDto,
          organizer_id: user_id,
          banner_url: bannerImageUrl,
          slug: slug,
          location: {
            x: geocodeResponse.longitude,
            y: geocodeResponse.latitude,
          },
          starts_at: new Date(createEventDto.starts_at),
          ends_at: new Date(createEventDto.ends_at),
        })
        .returning();

      const event = result[0];

      for (const image of files.images) {
        const imageUrl = await this.storageService.upload(
          image,
          `user_${user_id}/event_${event.id}/images`,
        );

        await trx.insert(schema.event_images).values({
          event_id: event.id,
          url: imageUrl,
          mimetype: image.mimetype,
          name: image.originalname,
          size: image.size,
        });
      }

      await trx
        .insert(schema.event_tickets)
        .values(
          this.eventsMapper.eventTicketDtoToCreateEventTicketData(
            event.id,
            createEventDto.event_tickets,
          ),
        );

      return event;
    });

    return createdEvent;
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

  async findOneElseThrow(id: string): Promise<EventsEntity> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new NotFoundException('Event with this Id does not exists!');
    }

    return event;
  }

  async createBannerUploadPresignUrl(
    id: string,
    user_id: string,
    bannerImagePreSignDto: BannerImageUploadPresignDto,
  ): Promise<PreSignedResponse> {
    const event = await this.findOneElseThrow(id);

    const path: string = `user_${user_id}/event_${event.id}`;

    const response = await this.r2StorageService.createPresignedUploadUrl(
      `${path}/${bannerImagePreSignDto.filename}`,
      300,
      bannerImagePreSignDto.mimetype,
    );

    this.logger.log(
      `Successfully generated pre-sign URL for banner ${event.id} upload!`,
    );

    return response;
  }

  async updateBanner(
    id: string,
    bannerImageKey: string,
  ): Promise<BannerUpdateResponseDto> {
    const publicUrl = this.configService.get<string>('r2.public_url');

    const bannerUrl = `${publicUrl}/${bannerImageKey}`;

    const event = await this.findOneElseThrow(id);

    await this.eventsRepository.update(event.id, {
      banner_url: bannerUrl,
    });

    this.logger.log(`Successfully updated banner URL for event ${event.id}!`);

    return {
      banner_url: bannerUrl,
    };
  }
}
