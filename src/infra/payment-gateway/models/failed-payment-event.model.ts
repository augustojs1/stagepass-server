export class FailedPaymentEventPayload {
  order_id: string;
  error_code: string;
  error_decline_code: string;
  error_message: string;
}
