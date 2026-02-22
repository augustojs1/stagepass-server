export abstract class IPaymentMessageProducer {
  abstract emitSuccess(payload: any): void;
  abstract emitFailed(payload: any): void;
}
