import { z } from 'zod';

import { uploadPresignPayload } from '@/infra/storage/models/upload-pre-sign-payload';

export type BannerImageUploadPresignDto = z.infer<typeof uploadPresignPayload>;
