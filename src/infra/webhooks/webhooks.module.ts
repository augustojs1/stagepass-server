import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WebhooksController } from './webhooks.controller';

@Module({
  controllers: [WebhooksController],
  imports: [ConfigModule],
})
export class WebhooksModule {}
