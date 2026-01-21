import { z } from 'zod';

import { uploadPresignPayloadSchema } from '@/infra/storage/models/upload-pre-sign-payload';

export type BannerImageUploadPresignDto = z.infer<
  typeof uploadPresignPayloadSchema
>;
