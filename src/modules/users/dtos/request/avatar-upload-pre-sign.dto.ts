import { z } from 'zod';

import { uploadPresignPayload } from '@/infra/storage/models/upload-pre-sign-payload';

export type AvatarUploadPreSignDto = z.infer<typeof uploadPresignPayload>;
