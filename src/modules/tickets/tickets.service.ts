import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { TicketsRepository } from './tickets.repository';
import { TicketsMapper } from './mappers/tickets.mapper';
import { UserTicketsDto } from './dtos';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly ticketsMapper: TicketsMapper,
  ) {}

  async validate(organizer_id: string, code: string) {
    this.logger.log(
      `Init ticket validation for code=${code}, organizer_id=${organizer_id}!`,
    );

    try {
      const ticket = await this.ticketsRepository.findByCodeAndEventOrganizerId(
        organizer_id,
        code,
      );

      if (!ticket) {
        this.logger.error(
          `Organizer is not event ticket owner code=${code}, organizer_id=${organizer_id}!`,
        );

        throw new ForbiddenException();
      }

      if (ticket.checked_in || ticket.checked_in_at) {
        this.logger.error(
          `Ticket is already validate code=${code}, organizer_id=${organizer_id}!`,
        );

        throw new ConflictException('Ticket is already validated!');
      }

      await this.ticketsRepository.update(ticket.id, {
        checked_in: true,
        checked_in_at: new Date(),
      });

      this.logger.log(
        `Successfully updated ticket code=${code}, organizer_id=${organizer_id}!`,
      );
    } catch (error) {
      const e = error as Error;

      this.logger.error(
        `Failed to validate ticket code=${code}, organizer_id=${organizer_id}!`,
        e?.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unexpected error!');
    }
  }

  async findOwnerTickets(owner_id: string): Promise<UserTicketsDto[]> {
    try {
      const ownerEventTickets =
        await this.ticketsRepository.findTicketsWithEventDataByOwnerId(
          owner_id,
        );

      return this.ticketsMapper.eventTicketsToUserTicketsDto(ownerEventTickets);
    } catch (error) {
      const e = error as Error;

      this.logger.error(
        `Error while trying to find owner tickets owner_id=${owner_id}!`,
        e?.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Unexpected error!');
    }
  }
}
