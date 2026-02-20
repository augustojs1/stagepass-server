import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StripeController } from '../payment-gateway/impl/stripe/stripe.controller';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

@Module({
  controllers: [StripeController],
  imports: [ConfigModule, PaymentGatewayModule],
})
export class WebhooksModule {}
