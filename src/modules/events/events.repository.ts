import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import { CreateEventDto } from './dto/create-event.dto';
import {
  CreateEventImageData,
  CreateEventTicketData,
  EventsEntity,
} from './models';
import { EventImageEntity } from './models/event-image-entity.model';

@Injectable()
export class EventsRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(data: CreateEventDto): Promise<EventsEntity> {
    const events = await this.drizzle
      .insert(schema.events)
      .values({
        ...data,
        organizer_id: '9874efe6-44a9-4352-bba8-8e3e2adc98ae',
        banner_url: 'https://stagepass.augustojsdev.com.br/assets/7dnsaaas',
        slug: 'aaa',
        location: { x: -90.9, y: 18.7 },
        is_free: false,
        starts_at: new Date(data.starts_at),
        ends_at: new Date(data.ends_at),
      })
      .returning();

    return events[0];
  }

  async createEventTickets(data: CreateEventTicketData[]) {
    await this.drizzle.insert(schema.event_tickets).values(data);
  }

  async findByName(name: string): Promise<EventsEntity | null> {
    const events = await this.drizzle
      .select()
      .from(schema.events)
      .where(eq(schema.events.name, name));

    return events[0];
  }

  async findBySlug(slug: string): Promise<EventsEntity | null> {
    const events = await this.drizzle
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, slug));

    return events[0];
  }

  async createEventImage(
    createEventImageData: CreateEventImageData,
  ): Promise<void> {
    await this.drizzle.insert(schema.event_images).values({
      ...createEventImageData,
    } as EventImageEntity);
  }
}
