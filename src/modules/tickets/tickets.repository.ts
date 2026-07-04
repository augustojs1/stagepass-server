import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import { TicketEntity } from './models';
import { UpdateTicketParams } from './models/update-ticket-params.model';

@Injectable()
export class TicketsRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async findByCodeAndEventOrganizerId(
    organizer_id: string,
    code: string,
  ): Promise<TicketEntity | null> {
    // select
    // 	*
    // from
    // 	tickets t
    // inner join
    // 	event_tickets et
    // on
    // 	t.event_ticket_id = et.id
    // inner join
    // 	events e
    // on
    // 	e.id = et.event_id
    // where
    // 	e.organizer_id = '123456'
    // and
    // 	t.code = '123456';
    const result = await this.drizzle
      .select({
        id: schema.tickets.id,
        order_item_id: schema.tickets.order_item_id,
        owner_id: schema.tickets.owner_id,
        event_ticket_id: schema.tickets.event_ticket_id,
        file_url: schema.tickets.file_url,
        checked_in: schema.tickets.checked_in,
        checked_in_at: schema.tickets.checked_in_at,
        code: schema.tickets.code,
        updated_at: schema.tickets.updated_at,
        created_at: schema.tickets.created_at,
      })
      .from(schema.tickets)
      .innerJoin(
        schema.event_tickets,
        eq(schema.tickets.event_ticket_id, schema.event_tickets.id),
      )
      .innerJoin(
        schema.events,
        eq(schema.events.id, schema.event_tickets.event_id),
      )
      .where(
        and(
          eq(schema.events.organizer_id, organizer_id),
          eq(schema.tickets.code, code),
        ),
      );

    return result[0] ?? null;
  }

  async update(id: string, data: UpdateTicketParams): Promise<void> {
    await this.drizzle
      .update(schema.tickets)
      .set({
        ...data,
      })
      .where(eq(schema.tickets.id, id));
  }
}
