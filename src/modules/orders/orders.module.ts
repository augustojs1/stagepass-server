import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { EventsModule } from '../events/events.module';
import { DateProvider } from '../shared/providers';
import { OrdersMapper } from './mappers';
import { PaymentGatewayModule } from '@/infra/payment-gateway/payment-gateway.module';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository,
    JwtService,
    DateProvider,
    OrdersMapper,
  ],
  imports: [EventsModule, PaymentGatewayModule],
})
export class OrdersModule {}
