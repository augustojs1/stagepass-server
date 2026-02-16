import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import { PaymentOrdersRepository } from './payment-orders.repository';
import { InsertPaymentOrdersParams } from './models/insert-payment-orders-params.model';
import { PaymentOrderEntity } from './models/payment-order-entity.model';
import { CheckoutSessionData } from '@/infra/payment-gateway/models';
import { DATABASE_TAG } from '@/infra/database/orm/drizzle/drizzle.module';
import * as schema from '@/infra/database/orm/drizzle/schema';
import { PaymentProviders } from './enum';
import { DateProvider } from '../shared/providers';

@Injectable()
export class PaymentOrdersService {
  private readonly logger: Logger = new Logger(PaymentOrdersService.name);

  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
    private readonly paymentOrdersRepository: PaymentOrdersRepository,
    private readonly dateProvider: DateProvider,
  ) {}

  async create(data: InsertPaymentOrdersParams): Promise<void> {
    await this.paymentOrdersRepository.create(data);

    this.logger.log(`Created new payment for order=${data.order_id}`);
  }

  async findLastPaymentOrderByOrderBy(
    order_id: string,
  ): Promise<PaymentOrderEntity> {
    return await this.paymentOrdersRepository.findLastPaymentOrderByOrderBy(
      order_id,
    );
  }

  async update(paymentOrder: PaymentOrderEntity): Promise<void> {
    return await this.paymentOrdersRepository.update(paymentOrder);
  }

  async updateAndCreateNewPaymentOrderTransaction(
    checkout_session_data: CheckoutSessionData,
    payment_order: PaymentOrderEntity,
  ): Promise<void> {
    await this.drizzle.transaction(async (trx) => {
      await trx
        .update(schema.payment_orders)
        .set({
          ...payment_order,
        })
        .where(eq(schema.payment_orders.id, payment_order.id));

      await trx.insert(schema.payment_orders).values({
        order_id: payment_order.order_id,
        amount: payment_order.amount,
        currency: 'USD',
        provider: PaymentProviders[payment_order.provider],
        provider_reference_id: checkout_session_data.provider_reference_id,
        status: 'PENDING',
        checkout_url: checkout_session_data.checkout_url,
        checkout_url_expires_at: new Date(
          this.dateProvider.unixToTimestampTz(
            checkout_session_data.checkout_url_expires_at,
            'America/Sao_Paulo',
          ),
        ),
      });
    });

    return;
  }
}
