import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { IPaymentMessageProducer } from '@/infra/messages/producers/interfaces/message-producer.interface';
import { MessageQueues } from '@/infra/messages/producers/enums';

@Injectable()
export class PaymentMessageRabbitMqProducer implements IPaymentMessageProducer {
  private readonly logger = new Logger(PaymentMessageRabbitMqProducer.name);

  constructor(
    @Inject('payment_queue')
    private readonly rabbitMqClient: ClientProxy,
  ) {}

  emitSuccess(payload: any): void {
    this.rabbitMqClient.emit(MessageQueues.PAYMENT_SUCESS, payload);

    this.logger.log(
      `Publish message on queue ${MessageQueues.PAYMENT_SUCESS}.`,
    );
  }

  emitFailed(payload: any): void {
    this.rabbitMqClient.emit(MessageQueues.PAYMENT_FAILED, payload);

    this.logger.log(
      `Publish message on queue ${MessageQueues.PAYMENT_FAILED}.`,
    );
  }
}
