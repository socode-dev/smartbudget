import { z } from "zod";

const schemas = {
  transactions: z.object({
    category: z.string().min(1, { message: "Select a category" }),
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z
      .string()
      .default(new Date().toISOString().split("T")[0])
      .refine((value) => new Date(value) <= new Date(), {
        message: "Date must not be later than today",
      }),
    description: z.string().optional(),

    // radio button
    type: z
      .enum(["income", "expense"], {
        message: "Select a type",
      })
      .optional(),
  }),

  budgets: z.object({
    category: z.string().min(1, { message: "Select a category" }),
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z
      .string()
      .default(new Date().toISOString().split("T")[0])
      .refine((value) => new Date(value) >= new Date(), {
        message: "Date must be today or later",
      })
      .optional(),
    description: z.string().optional(),

    // radio button
    type: z
      .enum(["income", "expense"], {
        message: "Select a type",
      })
      .optional(),
  }),
  goals: z.object({
    name: z.string().min(1, { message: "Enter a name" }),
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z
      .string()
      .default(new Date().toISOString().split("T")[0])
      .refine((value) => new Date(value) >= new Date(), {
        message: "Date must be today or later",
      })
      .optional(),
    description: z.string().optional(),
  }),
  contributions: z.object({
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z
      .string()
      .default(new Date().toISOString().split("T")[0])
      .refine((value) => new Date(value) <= new Date(), {
        message: "Date must not be later than today",
      })
      .optional(),
    description: z.string().optional(),
  }),
};

export default schemas;
