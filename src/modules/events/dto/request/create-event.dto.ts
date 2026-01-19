import { z } from 'zod';

export const eventTicketDto = z
  .object({
    name: z.string().min(1).max(50),
    amount: z.coerce.number().min(1),
    price: z.coerce.number().min(0.1),
  })
  .strict();

export const galleryImagesDto = z
  .object({
    image_key: z.string().min(1),
    mimetype: z.string().min(1),
    size: z.number(),
  })
  .strict();

export const createEventDtoSchema = z
  .object({
    name: z.string().min(1).max(50),
    event_category_id: z.uuidv4().min(1),
    description: z.string().min(1).max(500),
    is_free: z.coerce.boolean(),
    address_street: z.string().min(1).max(30),
    address_number: z.string().min(1).max(30),
    address_neighborhood: z.string().min(1).max(30),
    address_district: z.string().min(1).max(30),
    address_city: z.string().min(1).max(30),
    country_id: z.string().min(1).max(30),
    starts_at: z.coerce.date(),
    ends_at: z.coerce.date(),
    event_tickets: z.array(eventTicketDto).min(1),
  })
  .strict();

export type CreateEventTicketDto = z.infer<typeof eventTicketDto>;
export type CreateEventDto = z.infer<typeof createEventDtoSchema>;
export type EventGalleryImagesDto = z.infer<typeof galleryImagesDto>;
