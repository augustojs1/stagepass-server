import { PaymentProviders } from '@/modules/payment-orders/enum';

export class CheckoutSessionData {
  provider: PaymentProviders;
  checkout_url: string;
  checkout_url_expires_at: number;
}
