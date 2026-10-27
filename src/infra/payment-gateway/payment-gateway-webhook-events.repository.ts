import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '@/infra/database/orm/drizzle/schema';
import { DATABASE_TAG } from '../database/orm/drizzle/drizzle.module';
import { InsertPaymentGatewayWebhookEventParams } from './models/insert-payment-gateway-webhook-event-params.model';

@Injectable()
export class PaymentGatewayWebhookEventsRepository {
  constructor(
    @Inject(DATABASE_TAG)
    private readonly drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async insert(data: InsertPaymentGatewayWebhookEventParams): Promise<void> {
    await this.drizzle
      .insert(schema.payment_gateway_webhook_events)
      .values(data)
      .onConflictDoNothing({
        target: [schema.payment_gateway_webhook_events.provider_reference_id],
      });
  }
}
