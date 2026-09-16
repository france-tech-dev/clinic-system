import { BILLING_PLANS } from "@/shared/constants/billing-plans";
import { z } from "zod";

export const subscribePlanSchema = z.object({
  plan: z.enum(BILLING_PLANS),
});

export const setExtraSeatsSchema = z.object({
  quantity: z.number().int().min(0).max(50),
});
