import { Injectable } from '@nestjs/common';

import { OrdersEntity } from '../models';
import { CreateOrderResponseDto } from '../dto';

@Injectable()
export class OrdersMapper {
  mapOrderEntityToCreateOrderReponseDto(
    orderEntity: OrdersEntity,
  ): CreateOrderResponseDto {
    return {
      id: orderEntity.id,
      event_id: orderEntity.event_id,
      user_id: orderEntity.user_id,
      total_price: orderEntity.total_price,
      status: orderEntity.status,
      reservation_expires_at: orderEntity.reservation_expires_at,
      updated_at: orderEntity.updated_at,
      created_at: orderEntity.created_at,
    };
  }
}
