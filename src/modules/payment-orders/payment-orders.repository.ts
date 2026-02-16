import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { desc, eq } from 'drizzle-orm';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import { InsertPaymentOrdersParams } from './models/insert-payment-orders-params.model';
import { PaymentOrderEntity } from './models/payment-order-entity.model';

@Injectable()
export class PaymentOrdersRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(data: InsertPaymentOrdersParams): Promise<void> {
    await this.drizzle.insert(schema.payment_orders).values({
      ...data,
    });
  }

  async findLastPaymentOrderByOrderBy(
    order_id: string,
  ): Promise<PaymentOrderEntity> {
    const result = await this.drizzle
      .select()
      .from(schema.payment_orders)
      .where(eq(schema.payment_orders.order_id, order_id))
      .orderBy(desc(schema.payment_orders.created_at));

    return result[0] ?? null;
  }

  async update(paymentOrderEntity: PaymentOrderEntity): Promise<void> {
    await this.drizzle
      .update(schema.payment_orders)
      .set({
        ...paymentOrderEntity,
      })
      .where(eq(schema.payment_orders.id, paymentOrderEntity.id));
  }
}
