import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IPaymentGateway } from '@/infra/payment-gateway/ipayment-gateway.interface';
import { StripePaymentGatewayService } from '@/infra/payment-gateway/impl';

@Module({
  providers: [
    {
      provide: IPaymentGateway,
      useClass: StripePaymentGatewayService,
    },
  ],
  exports: [IPaymentGateway],
  imports: [ConfigModule],
})
export class PaymentGatewayModule {}
