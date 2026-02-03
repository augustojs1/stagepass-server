import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { OrdersRepository } from './orders.repository';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  CreateOrderResponseDto,
  OrderItemResponseDto,
} from './dto';
import { EventsService } from '../events/events.service';
import { DateProvider } from '../shared/providers';
import { OrdersMapper } from './mappers';
import { OrderItemEntity, OrdersEntity } from './models';

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

  private async findOneElseThrow(order_id: string): Promise<OrdersEntity> {
    const order = await this.ordersRepository.findOneById(order_id);

    if (!order) {
      this.logger.error('Order with this id not found!');
      throw new NotFoundException('Order with this id not found!');
    }

    return order;
  }

  private async findOneItemElseThrow(
    order_item_id: string,
  ): Promise<OrderItemEntity> {
    const orderItem =
      await this.ordersRepository.findOneOrderItemById(order_item_id);

    if (!orderItem) {
      this.logger.error('Order item with this id not found!');
      throw new NotFoundException('Order item with this id not found!');
    }

    return orderItem;
  }

  async createOrderItem(
    user_id: string,
    order_id: string,
    createOrderItemDto: CreateOrderItemDto,
  ): Promise<OrderItemResponseDto[]> {
    try {
      const order = await this.findOneElseThrow(order_id);

      if (user_id !== order.user_id) {
        this.logger.error(`User ${user_id} does not own order ${order.id}`);
        throw new ForbiddenException(`User does not own order!`);
      }

      const eventTicket = await this.eventsService.findEventTicketByIdElseThrow(
        createOrderItemDto.event_ticket_id,
      );

      if (order.event_id !== eventTicket.event_id) {
        this.logger.error(
          `event_ticket_id=${eventTicket.id} does not belong to order=${order.id} !`,
        );
        throw new BadRequestException(
          `Event ticket does not belong to order event!`,
        );
      }

      if (eventTicket.sold || eventTicket.amount <= 0) {
        this.logger.error(`Event ticket ${eventTicket.id} is sold out!`);
        throw new BadRequestException('Tickets for this event is sold out!');
      }

      const orderItem = await this.ordersRepository.insertOrderItem({
        order_id: order.id,
        event_ticket_id: eventTicket.id,
        unit_price: eventTicket.price,
        owner_email: createOrderItemDto.owner_email,
        owner_name: createOrderItemDto.owner_name,
      });

      this.logger.log(`Succesfully created order item ${orderItem.id}`);

      return this.ordersMapper.mapOrderItemEntityToOrderItemResponseDto(
        await this.ordersRepository.findOrderItemByOrderId(orderItem.order_id),
      );
    } catch (error) {
      const e = error as Error;

      this.logger.error(
        `Failed to create order item user_id=${user_id}, order_id=${order_id} event_ticket_id=${createOrderItemDto.event_ticket_id}!`,
        e?.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create order item!');
    }
  }

  async removeOrderItem(
    user_id: string,
    order_id: string,
    order_item_id: string,
  ): Promise<void> {
    try {
      const order = await this.findOneElseThrow(order_id);

      if (user_id !== order.user_id) {
        this.logger.error(`User ${user_id} does not own order ${order.id}`);
        throw new ForbiddenException(`User does not own order!`);
      }

      if (order.status !== 'PENDING') {
        this.logger.error(
          'Order items can only be removed when order status is PENDING',
        );
        throw new UnprocessableEntityException(
          'Order items can only be removed when order status is PENDING',
        );
      }

      const orderItem = await this.findOneItemElseThrow(order_item_id);

      if (order.id !== orderItem.order_id) {
        this.logger.error(
          `Order item ${orderItem.id} is not related to order ${order.id}`,
        );
        throw new ForbiddenException(
          `Order item should be related to the order`,
        );
      }

      await this.ordersRepository.deleteOrderItemById(orderItem.id);
    } catch (error) {
      const e = error as Error;

      this.logger.error(
        `Failed to delete order item user_id=${user_id}, order_id=${order_id}, order_item_id=${order_item_id}`,
        e?.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to remove order item');
    }
  }
}
