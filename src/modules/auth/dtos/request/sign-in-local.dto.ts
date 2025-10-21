import { z } from 'zod';

export const signInLocalDtoSchema = z
  .object({
    email: z.email().min(1).max(50),
    password: z.string().min(1).max(30),
  })
  .required();

export type SignInLocalDto = z.infer<typeof signInLocalDtoSchema>;
