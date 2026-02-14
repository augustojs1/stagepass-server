import { Module } from '@nestjs/common';

import { PaymentOrdersService } from './payment-orders.service';

@Module({
  providers: [PaymentOrdersService],
  exports: [PaymentOrdersService],
})
export class PaymentOrdersModule {}
