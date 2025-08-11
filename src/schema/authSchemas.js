import { z } from "zod";

const authSchemas = {
  login: z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    remember: z.boolean().optional(),
  }),

  signup: z
    .object({
      firstName: z.string().min(2, "Too short"),
      lastName: z.string().min(2, "Too short"),
      email: z.email(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters"),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password do not match",
        });
      }
    }),

  forgot: z.object({
    email: z.email(),
  }),

  reset: z
    .object({
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters"),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password do not match",
        });
      }
    }),
};

export default authSchemas;
