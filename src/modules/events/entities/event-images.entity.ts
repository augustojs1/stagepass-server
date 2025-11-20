import { sql } from 'drizzle-orm';
import {
  AnyPgColumn,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  integer,
} from 'drizzle-orm/pg-core';

import { events } from '@/modules/events/entities';

export const event_images = pgTable('event_images', {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid`),
  event_id: uuid()
    .references((): AnyPgColumn => events.id)
    .notNull(),
  name: text().notNull(),
  url: text().notNull(),
  mimetype: varchar({ length: 20 }).notNull(),
  size: integer().notNull(),
  updated_at: timestamp().defaultNow(),
  created_at: timestamp().defaultNow(),
});
