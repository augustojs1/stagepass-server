import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppExceptionFilter } from '@/infra/filters';

async function bootstrap() {
  const PORT = process.env.PORT;
  const NODE_ENV = process.env.NODE_ENV;

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new AppExceptionFilter());

  app.setGlobalPrefix('api/v1');

  app.use(
    '/api/v1/webhooks/payment/stripe',
    express.raw({ type: 'application/json' }),
  );

  await app.listen(PORT ?? 8080, '0.0.0.0');

  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}! 🚀`);
}

bootstrap();
