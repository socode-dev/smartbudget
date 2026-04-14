import { z } from "zod";

const optionalInputString = z.string().trim().optional().or(z.literal(""));

const schemas = {
  transactions: z
    .object({
      category: optionalInputString,
      name: optionalInputString,
      amount: z.coerce
        .number({ invalid_type: "Please enter a valid amount" })
        .gt(0, { message: "Amount must be greater than 0" }),
      date: z.string(),
      description: z.string().optional(),

      // radio button
      type: z
        .enum(["income", "expense"], {
          message: "Select a type",
        })
        .optional(),
    })
    .superRefine(({ category, name }, ctx) => {
      if (!category?.trim() && !name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category"],
          message: "Select a category or enter a custom category",
        });
      }
    }),

  budgets: z
    .object({
      category: optionalInputString,
      name: optionalInputString,
      amount: z.coerce
        .number({ invalid_type: "Please enter a valid amount" })
        .gt(0, { message: "Amount must be greater than 0" }),
      date: z.string().optional(),
      description: z.string().optional(),

      // radio button
      type: z
        .enum(["income", "expense"], {
          message: "Select a type",
        })
        .optional(),
    })
    .superRefine(({ category, name }, ctx) => {
      if (!category?.trim() && !name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["category"],
          message: "Select a category or enter a custom category",
        });
      }
    }),
  goals: z.object({
    name: z.string().min(1, { message: "Enter a name" }),
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z.string().optional(),
    description: z.string().optional(),
  }),
  contributions: z.object({
    name: z.string().min(1, { message: "Enter a name" }),
    amount: z.coerce
      .number({ invalid_type: "Please enter a valid amount" })
      .gt(0, { message: "Amount must be greater than 0" }),
    date: z.string().optional(),
    description: z.string().optional(),
  }),
};

export default schemas;
