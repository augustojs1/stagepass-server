import { Injectable } from '@nestjs/common';

import { CreateEventTicketDto } from '../dto/request/create-event.dto';
import { CreateEventTicketData } from '../models';

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
}
