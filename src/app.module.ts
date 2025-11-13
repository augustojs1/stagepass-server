import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { configuration } from '@/infra/config/configuration';
import { AuthModule } from '@/modules/auth/auth.module';
import { DrizzleModule } from '@/infra/database/orm/drizzle/drizzle.module';
import { UsersModule } from '@/modules/users/users.module';
import { HttpRequestInterceptor } from '@/infra/interceptors';
import { CategoriesModule } from './modules/categories/categories.module';

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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRequestInterceptor,
    },
  ],
})
export class AppModule {}
