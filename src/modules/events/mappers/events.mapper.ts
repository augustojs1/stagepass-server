import { Injectable } from '@nestjs/common';

import { CreateEventTicketDto } from '../dto/request/create-event.dto';
import { CreateEventTicketData } from '../models';
import { EventWithTicketsAndImages } from '../models/event-with-tickets-and-images.model';
import { EventsWithTicketsAndImagesDto } from '../dto';

@Injectable()
export class EventsMapper {
  eventTicketDtoToCreateEventTicketData(
    event_id: string,
    event_ticket_dto: CreateEventTicketDto[],
  ): CreateEventTicketData[] {
    return event_ticket_dto.map((event_ticket) => {
      return {
        ...event_ticket,
        event_id: event_id,
        price: Math.round(event_ticket.price * 100),
      };
    });
  }

  eventToEventWithTicketsAndImagesDto(
    rows: EventWithTicketsAndImages[],
  ): EventsWithTicketsAndImagesDto {
    const imagesById = new Map<string, any>();
    const ticketsById = new Map<string, any>();

    for (const row of rows) {
      const img = row.event_images;
      if (img?.id && !imagesById.has(img.id)) {
        imagesById.set(img.id, {
          id: img.id,
          event_id: img.event_id,
          url: img.url,
          object_key: img.object_key,
          updated_at: img.updated_at,
          created_at: img.created_at,
        });
      }

      const t = row.event_tickets;
      if (t?.id && !ticketsById.has(t.id)) {
        ticketsById.set(t.id, {
          id: t.id,
          event_id: t.event_id,
          name: t.name,
          price: t.price,
          amount: t.amount,
          sold: t.sold,
          updated_at: t.updated_at,
          created_at: t.created_at,
        });
      }
    }

    return {
      ...rows[0].events,
      event_images: [...imagesById.values()],
      event_tickets: [...ticketsById.values()],
    };
  }
}
