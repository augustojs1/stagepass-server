import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { IPaymentMessageProducer } from './producers/interfaces/message-producer.interface';
import { PaymentMessageRabbitMqProducer } from './producers/impl/rabbit-mq/payment-message-rabbitmq.producer';
import { configuration } from '../config/configuration';

const env_variables = configuration();

@Module({
  imports: [
    ConfigModule,
    ClientsModule.register([
      {
        name: 'payment_queue',
        transport: Transport.RMQ,
        options: {
          urls: [env_variables.rmq.url],
          queue: env_variables.rmq.queue_payment_failed,
          queueOptions: {
            durable: true,
          },
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
