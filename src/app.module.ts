import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { configuration } from '@/infra/config/configuration';
import { AuthModule } from '@/modules/auth/auth.module';
import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { UsersModule } from '@/modules/users/users.module';
import { HttpRequestInterceptor } from '@/infra/interceptors';
import { CategoriesModule } from './modules/categories/categories.module';
import { EventsModule } from './modules/events/events.module';
import { AddressModule } from './modules/address/address.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WebhooksModule } from './infra/webhooks/webhooks.module';
import { PaymentOrdersModule } from './modules/payment-orders/payment-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/src/infra/config/env/${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [configuration],
    }),
    DrizzleModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    EventsModule,
    AddressModule,
    OrdersModule,
    WebhooksModule,
    PaymentOrdersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRequestInterceptor,
    },
  ],
})
export class AppModule {}
