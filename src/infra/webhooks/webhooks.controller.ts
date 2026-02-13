import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('webhooks')
export class WebhooksController {
  private readonly stripeClient: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripeClient = new Stripe(
      this.configService.get<string>('stripe.secret_key'),
      {
        apiVersion: '2026-01-28.clover',
      },
    );
  }

  @Post('payment/stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: Request) {
    const sig = req.headers['stripe-signature'];

    const event = this.stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      this.configService.get<string>('stripe.webhook_key'),
    );

    if (event.type === 'checkout.session.completed') {
      console.log('event.:', event);

      const session = event.data.object;

      const orderId = session.metadata?.orderId;
      const status = session.payment_status;

      if (status === 'paid') {
      }
    }

    return;
  }
}
