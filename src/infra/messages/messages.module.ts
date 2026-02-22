import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { IPaymentMessageProducer } from './producers/interfaces/message-producer.interface';
import { PaymentMessageRabbitMqProducer } from './producers/impl/rabbit-mq/payment-message-rabbitmq.producer';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'payment_queue',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'q.payment.failed',
          queueOptions: {
            durable: true,
          },
          exchange: 'ex.payments',
          prefetchCount: 10,
        },
      },
    ]),
  ],
  providers: [
    {
      provide: IPaymentMessageProducer,
      useClass: PaymentMessageRabbitMqProducer,
    },
  ],
  exports: [IPaymentMessageProducer],
})
export class MessagesModule {}
