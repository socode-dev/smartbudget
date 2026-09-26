import { z } from "zod";

const authSchemas = {
  login: z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),

  signup: z
    .object({
      firstName: z.string().min(2, "Too short"),
      lastName: z.string().min(2, "Too short"),
      email: z.email(),
      password: z
        .string()
        .min(6, "Password must contain at least 6 characters.")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .regex(/[0-9]/, "Password must contain at least one number.")
        .regex(/[^A-Za-z0-9\s]/, "Password must contain at least one special character.")
        .regex(/^\S+$/, "Password cannot contain spaces."),
      confirmPassword: z
        .string()
        .min(1, "Confirm your password"),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    }),

  forgot: z.object({
    email: z.email(),
  }),
};

export default authSchemas;
