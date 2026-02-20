import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IPaymentGateway } from '@/infra/payment-gateway/interfaces/ipayment-gateway.interface';
import { StripeService } from './impl/stripe/stripe.service';

@Module({
  providers: [
    {
      provide: IPaymentGateway,
      useClass: StripeService,
    },
    StripeService,
  ],
  exports: [IPaymentGateway, StripeService],
  imports: [ConfigModule],
})
export class PaymentGatewayModule {}
