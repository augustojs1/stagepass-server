import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { IPaymentGateway } from '@/infra/payment-gateway/interfaces/ipayment-gateway.interface';
import { CheckoutSessionData, OrderPaymentPayload } from './models';
import { PaymentProviders } from '@/modules/payment-orders/enum';

@Injectable()
export class StripeService implements IPaymentGateway {
  private readonly logger: Logger = new Logger(StripeService.name);
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

      this.logger.log('Stripe successfully processed payment', data);

      return {
        provider: PaymentProviders.STRIPE,
        provider_reference_id: session.id,
        checkout_url: session.url,
        checkout_url_expires_at: session.expires_at,
      };
    } catch (error) {
      this.logger.error('Stripe error processing a payment', data);
      throw error;
    }
  }

  async handleEvent(body: any, sig: string | string[]): Promise<void> {
    const event = this.stripeClient.webhooks.constructEvent(
      body,
      sig,
      this.configService.get<string>('stripe.webhook_key'),
    );

    console.log('Stripe event.:', event);

    // Guardar webhooks na tabela webhook_events

    // CASE: 'checkout.session.completed'
    // Localizar payment_order pelo provider_reference_id (session.id / payment_intent_id)
    // marca payment_orders como SUCCEEDED
    // marca orders como PAID
    // Desativar as reservas dessa order
    // Diminuir o quantity dos event tickets
    // Gerar tickets
    // obs: tentar guardar o receipt_url que vem de charge.updated
    // etc.

    // CASE: Falha
    // Webhook chega → marca payment_orders como FAILED
    // order continua AWAITING_PAYMENT pra permitir retry até expirar

    // if (event.type === 'checkout.session.completed') {

    //   const session = event.data.object;

    //   const orderId = session.metadata?.orderId;
    //   const status = session.payment_status;

    //   if (status === 'paid') {
    //   }
    // }
  }

  async handleSuccessEvent(event: any): Promise<void> {}
  async handleFailedEvent(event: any): Promise<void> {}
}
