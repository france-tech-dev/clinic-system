import { z } from "zod";
import { BILLING_PLANS } from "@/shared/constants/billing-plans";

export const subscribePlanSchema = z.object({
  plan: z.enum(BILLING_PLANS),
});

export type SubscribePlanInput = z.infer<typeof subscribePlanSchema>;

export const setExtraSeatsSchema = z.object({
  quantity: z.number().int().min(0).max(50),
});

export type SetExtraSeatsInput = z.infer<typeof setExtraSeatsSchema>;
