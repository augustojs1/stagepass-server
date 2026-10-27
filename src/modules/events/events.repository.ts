import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { SQL, and, asc, count, eq, ilike, inArray, sql } from 'drizzle-orm';

import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import {
  CreateEventData,
  CreateEventImageData,
  CreateEventTicketData,
  EventsEntity,
  EventTicketsEntity,
  FindEventsFilter,
  FindEventsResult,
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

  async findAll(filters: FindEventsFilter): Promise<FindEventsResult> {
    const conditions: SQL[] = [];

    if (filters.search) {
      conditions.push(ilike(schema.events.name, `%${filters.search}%`));
    }

    if (filters.category_ids?.length) {
      conditions.push(
        inArray(schema.events.event_category_id, filters.category_ids),
      );
    }

    if (filters.is_free !== undefined) {
      conditions.push(eq(schema.events.is_free, filters.is_free));
    }

    const hasLocationFilter =
      filters.latitude !== undefined &&
      filters.longitude !== undefined &&
      filters.radius_km !== undefined;

    const referencePoint = hasLocationFilter
      ? sql`
        ST_SetSRID(
          ST_MakePoint(
            ${filters.longitude},
            ${filters.latitude}
          ),
          4326
        )
      `
      : null;

    if (referencePoint && filters.radius_km !== undefined) {
      conditions.push(
        sql`
        ST_DWithin(
          ${schema.events.location}::geography,
          ${referencePoint}::geography,
          ${filters.radius_km * 1000}
        )
      `,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const lowestTicketPrice = sql<number | null>`
    CASE
      WHEN ${schema.events.is_free} = true THEN NULL
      ELSE MIN(${schema.event_tickets.price})
    END
  `;

    const distanceKm = referencePoint
      ? sql<number>`
        ROUND(
          (
            ST_Distance(
              ${schema.events.location}::geography,
              ${referencePoint}::geography
            ) / 1000
          )::numeric,
          2
        )::double precision
      `
      : sql<null>`NULL`;

    const offset = (filters.page - 1) * filters.per_page;

    const items = await this.drizzle
      .select({
        id: schema.events.id,
        name: schema.events.name,
        slug: schema.events.slug,
        banner_url: schema.events.banner_url,
        full_address: sql<string>`
        CONCAT_WS(
          ', ',
          ${schema.events.address_street},
          ${schema.events.address_number},
          ${schema.events.address_district},
          ${schema.events.address_city}
        )
      `,
        is_free: schema.events.is_free,
        lowest_ticket_price: lowestTicketPrice,
        distance_km: distanceKm,
      })
      .from(schema.events)
      .leftJoin(
        schema.event_tickets,
        eq(schema.events.id, schema.event_tickets.event_id),
      )
      .where(whereClause)
      .groupBy(schema.events.id)
      .orderBy(
        referencePoint ? asc(distanceKm) : asc(schema.events.starts_at),
        asc(schema.events.id),
      )
      .limit(filters.per_page)
      .offset(offset);

    const totalResult = await this.drizzle
      .select({
        total: count(),
      })
      .from(schema.events)
      .where(whereClause);

    return {
      items,
      total: totalResult[0]?.total ?? 0,
    };
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
