import { Injectable, Logger } from '@nestjs/common';

import { PaymentOrdersRepository } from './payment-orders.repository';
import { InsertPaymentOrdersParams } from './models/insert-payment-orders-params.model';
import { PaymentOrderEntity } from './models/payment-order-entity.model';

@Injectable()
export class PaymentOrdersService {
  private readonly logger: Logger = new Logger(PaymentOrdersService.name);

  constructor(
    private readonly paymentOrdersRepository: PaymentOrdersRepository,
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
}
