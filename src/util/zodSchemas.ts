import { z } from "zod";

export const userRegistrationSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6, { message: "password should contain more than 6 characters" }),
});

export const userGoogleRegistrationSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().email().min(1),
  googleId: z.string().min(1),
});

export type UserRegisterSchema = z.infer<typeof userRegistrationSchema>;
export type UserGoogleRegistrationSchema = z.infer<typeof userGoogleRegistrationSchema>;
