import { z } from 'zod';

export const forwardGeocoderDto = z
  .object({
    complement: z.string().min(1).max(20),
    street: z.string().min(1).max(50),
    city: z.string().min(1).max(50),
  })
  .required();

export type ForwardGeocoderDto = z.infer<typeof forwardGeocoderDto>;
