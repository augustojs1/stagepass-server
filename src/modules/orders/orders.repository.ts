import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { OrdersEntity } from './models';
import { InsertOrderParams } from './models/insert-order-params.model';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';

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
}
