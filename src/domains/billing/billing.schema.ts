import { z } from "zod";
import { BILLING_PLANS } from "@/shared/constants/billing-plans";

export const subscribePlanSchema = z.object({
  plan: z.enum(BILLING_PLANS),
});

export type SubscribePlanInput = z.infer<typeof subscribePlanSchema>;
