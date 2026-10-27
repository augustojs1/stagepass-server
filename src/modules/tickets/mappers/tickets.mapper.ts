import { Injectable } from '@nestjs/common';
import { EventTicket } from '../models';
import { UserTicketsDto } from '../dtos';

@Injectable()
export class TicketsMapper {
  eventTicketsToUserTicketsDto(data: EventTicket[]): UserTicketsDto[] {
    return data.map((eventAndTicket) => {
      return {
        ...eventAndTicket,
      };
    });
  }
}
