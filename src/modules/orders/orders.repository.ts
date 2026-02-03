import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { OrderItemEntity, OrdersEntity } from './models';
import { InsertOrderParams } from './models/insert-order-params.model';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import { InsertOrdemItemParams } from './models/insert-order-item-params';

@Injectable()
export class OrdersRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async insertOrder(
    inserOrderParams: InsertOrderParams,
  ): Promise<OrdersEntity> {
    const order = await this.drizzle
      .insert(schema.orders)
      .values({
        event_id: inserOrderParams.event_id,
        user_id: inserOrderParams.user_id,
        status: 'PENDING',
        total_price: 0,
        reservation_expires_at: null,
      })
      .returning();

    return order[0];
  }

  async findOneById(order_id: string): Promise<OrdersEntity | null> {
    const order = await this.drizzle
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, order_id));

    return order[0] ?? null;
  }

  async insertOrderItem(
    inserOrderItemParams: InsertOrdemItemParams,
  ): Promise<OrderItemEntity> {
    const orderItem = await this.drizzle
      .insert(schema.order_item)
      .values({
        order_id: inserOrderItemParams.order_id,
        event_ticket_id: inserOrderItemParams.event_ticket_id,
        owner_name: inserOrderItemParams.owner_name,
        owner_email: inserOrderItemParams.owner_email,
        unit_price: inserOrderItemParams.unit_price,
      })
      .returning();

    return orderItem[0];
  }

  async findOrderItemByOrderId(order_id: string): Promise<OrderItemEntity[]> {
    const orderItems = await this.drizzle
      .select()
      .from(schema.order_item)
      .where(eq(schema.order_item.order_id, order_id));

    return orderItems;
  }
}
