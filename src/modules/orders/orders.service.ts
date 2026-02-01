import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { OrdersRepository } from './orders.repository';
import { CreateOrderDto, CreateOrderResponseDto } from './dto';
import { EventsService } from '../events/events.service';
import { DateProvider } from '../shared/providers';
import { OrdersMapper } from './mappers';

@Injectable()
export class OrdersService {
  private readonly logger: Logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly eventsService: EventsService,
    private readonly dateProvider: DateProvider,
    private readonly ordersMapper: OrdersMapper,
  ) {}

  async create(
    user_id: string,
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    try {
      const MIN_HOURS_BEFORE_EVENT_STARTS = -1;

      const event = await this.eventsService.findOneElseThrow(
        createOrderDto.event_id,
      );

      const differenceInHours = this.dateProvider.differenceInHours(
        new Date(),
        new Date(event.starts_at),
      );

      if (differenceInHours >= MIN_HOURS_BEFORE_EVENT_STARTS) {
        this.logger.error(
          `Event starts at time limit has passed user_id=${user_id}, event_id=${createOrderDto.event_id}`,
        );
        throw new BadRequestException('Event starts at time limit has passed!');
      }

      const createdOrder = await this.ordersRepository.insertOrder({
        user_id,
        event_id: event.id,
      });

      this.logger.log(
        `Succesfully created order user_id=${user_id}, event_id=${createOrderDto.event_id}`,
      );

      return this.ordersMapper.mapOrderEntityToCreateOrderReponseDto(
        createdOrder,
      );
    } catch (error) {
      const e = error as Error;

      this.logger.error(
        `Failed to create order user_id=${user_id}, event_id=${createOrderDto.event_id}`,
        e?.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create order');
    }
  }
}
