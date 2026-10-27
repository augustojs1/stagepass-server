import { Module } from '@nestjs/common';

import { PaymentOrdersService } from './payment-orders.service';
import { PaymentOrdersRepository } from './payment-orders.repository';
import { DateProvider } from '../shared/providers';

@Module({
  providers: [PaymentOrdersService, PaymentOrdersRepository, DateProvider],
  exports: [PaymentOrdersService],
})
export class PaymentOrdersModule {}
