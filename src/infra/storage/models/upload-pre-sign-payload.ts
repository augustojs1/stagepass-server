import { z } from 'zod';

export const uploadPresignPayload = z
  .object({
    filename: z.string().min(1).max(50),
    mimetype: z.string().min(1).max(30),
    size: z.number(),
  })
  .required();

export type UploadPresignPayload = z.infer<typeof uploadPresignPayload>;
