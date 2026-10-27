import { z } from 'zod';

export const signUpLocalDtoSchema = z
  .object({
    email: z.email().min(1).max(50),
    first_name: z.string().min(1).max(30),
    last_name: z.string().min(1).max(30),
    password: z.string().min(1).max(30),
  })
  .required();

export type SignUpLocalDto = z.infer<typeof signUpLocalDtoSchema>;
