import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { IPaymentGateway } from '@/infra/payment-gateway/ipayment-gateway.interface';
import { CheckoutSessionData, OrderPaymentPayload } from '../models';
import { PaymentProviders } from '@/modules/payment-orders/enum';

@Injectable()
export class StripePaymentGatewayService implements IPaymentGateway {
  private readonly logger: Logger = new Logger(
    StripePaymentGatewayService.name,
  );
  private readonly stripeClient: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripeClient = new Stripe(
      this.configService.get<string>('stripe.secret_key'),
      {
        apiVersion: '2026-01-28.clover',
      },
    );

    this.logger.log('Succesfully init Stripe Client');
  }

  public async process(
    data: OrderPaymentPayload,
  ): Promise<CheckoutSessionData> {
    this.logger.log('Stripe received payment to process', data);

    try {
      const session = await this.stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Order #${data.order_id}`,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://stagepass.augustojsdev.com.br/payment/success?orderId=${data.order_id}`,
        cancel_url: `https://stagepass.augustojsdev.com.br/payment/failed?orderId=${data.order_id}`,
        metadata: {
          orderId: data.order_id,
        },
      });

      console.log('Stripe session::', session);

      this.logger.log('Stripe successfully processed payment', data);

      return {
        provider: PaymentProviders.STRIPE,
        checkout_url: session.url,
        checkout_url_expires_at: session.expires_at,
      };
    } catch (error) {
      this.logger.error('Stripe error processing a payment', data);
      throw error;
    }
  }
}
