import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import {
  CreateEventData,
  CreateEventImageData,
  CreateEventTicketData,
  EventsEntity,
  EventTicketsEntity,
} from './models';
import { EventWithTicketsAndImages } from './models/event-with-tickets-and-images.model';

@Injectable()
export class EventsRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(data: CreateEventData): Promise<EventsEntity> {
    const events = await this.drizzle
      .insert(schema.events)
      .values({
        ...data,
      })
      .returning();

    return events[0];
  }

  async createEventTickets(data: CreateEventTicketData[]): Promise<void> {
    await this.drizzle.insert(schema.event_tickets).values(data);
  }

  async findById(id: string): Promise<EventsEntity | null> {
    const events = await this.drizzle
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id));

    return events[0];
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

  async update(id: string, data: Partial<EventsEntity>): Promise<void> {
    await this.drizzle
      .update(schema.events)
      .set({
        ...data,
      })
      .where(eq(schema.events.id, id));
  }

  async createEventImage(
    createEventImageData: CreateEventImageData[],
  ): Promise<void> {
    await this.drizzle.insert(schema.event_images).values(createEventImageData);
  }

  async findEventTicketById(
    event_ticket_id: string,
  ): Promise<EventTicketsEntity | null> {
    const eventTicket = await this.drizzle
      .select()
      .from(schema.event_tickets)
      .where(eq(schema.event_tickets.id, event_ticket_id));

    return eventTicket[0] ?? null;
  }

  async findWithTicketsAndImagesById(
    event_id: string,
  ): Promise<EventWithTicketsAndImages[]> {
    const eventWithTickets = await this.drizzle
      .select()
      .from(schema.events)
      .innerJoin(
        schema.event_tickets,
        eq(schema.events.id, schema.event_tickets.event_id),
      )
      .innerJoin(
        schema.event_images,
        eq(schema.events.id, schema.event_images.event_id),
      )
      .where(eq(schema.events.id, event_id));

    return eventWithTickets;
  }

  async findWithTicketsAndImagesBySlug(
    slug: string,
  ): Promise<EventWithTicketsAndImages[]> {
    const eventWithTickets = await this.drizzle
      .select()
      .from(schema.events)
      .innerJoin(
        schema.event_tickets,
        eq(schema.events.id, schema.event_tickets.event_id),
      )
      .innerJoin(
        schema.event_images,
        eq(schema.events.id, schema.event_images.event_id),
      )
      .where(eq(schema.events.slug, slug));

    return eventWithTickets;
  }
}
