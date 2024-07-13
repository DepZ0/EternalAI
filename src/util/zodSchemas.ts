import { z } from "zod";

export const userRegistrationSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6, { message: "password should contain more than 6 characters" }),
});
export type UserRegisterSchema = z.infer<typeof userRegistrationSchema>;
