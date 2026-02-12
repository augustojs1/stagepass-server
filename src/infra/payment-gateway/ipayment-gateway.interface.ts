import { OrderPaymentPayload } from '@/infra/payment-gateway/models';

export abstract class IPaymentGateway {
  abstract process(data: OrderPaymentPayload): Promise<{ payment_url: string }>;
}
