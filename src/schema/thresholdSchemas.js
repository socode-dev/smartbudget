import { z } from "zod";

export const thresholdSchemas = z.object({
  transactionThreshold: z.coerce.number().default(5000).optional(),

  // Budget thresholds
  budgetThreshold50: z.coerce.number().min(1).max(100).optional(),
  budgetThreshold80: z.coerce.number().min(50).max(200).optional(),
  budgetThreshold100: z.coerce.number().min(80).max(300).optional(),

  // Goal thresholds
  goalThreshold50: z.coerce.number().min(1).max(100).optional(),
  goalThreshold80: z.coerce.number().min(50).max(200).optional(),
  goalThreshold100: z.coerce.number().min(80).max(300).optional(),
});

export const defaultThresholds = {
  transactionThreshold: 5000,

  budgetThreshold50: 50,
  budgetThreshold80: 80,
  budgetThreshold100: 100,

  goalThreshold50: 50,
  goalThreshold80: 80,
  goalThreshold100: 100,
};
