import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IPaymentGateway } from '@/infra/payment-gateway/interfaces/ipayment-gateway.interface';
import { StripeService } from './impl/stripe/stripe.service';
import { MessagesModule } from '../messages/messages.module';
import { PaymentGatewayWebhookEventsRepository } from './payment-gateway-webhook-events.repository';

@Module({
  providers: [
    {
      provide: IPaymentGateway,
      useClass: StripeService,
    },
    StripeService,
    PaymentGatewayWebhookEventsRepository,
  ],
  exports: [IPaymentGateway, StripeService],
  imports: [ConfigModule, MessagesModule],
})
export class PaymentGatewayModule {}
