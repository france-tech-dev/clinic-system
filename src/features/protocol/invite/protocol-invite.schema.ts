import { z } from "zod";

const INVITE_DEFAULT_DAYS = 30;

export const createProtocolInviteSchema = z.object({
  patientId: z.string().min(1),
  protocolIds: z
    .array(z.string().min(1))
    .min(1, "Selecione pelo menos um instrumento"),
  /** Dias até expirar; default 30. */
  expiresInDays: z.number().int().min(1).max(365).optional().default(INVITE_DEFAULT_DAYS),
});

export const protocolInviteIdSchema = z.object({
  id: z.string().min(1),
});

export const listProtocolInvitesSchema = z.object({
  patientId: z.string().min(1),
});

export const publicInviteTokenSchema = z.object({
  token: z.string().min(16).max(128),
});

export const publicInviteInstrumentSchema = z.object({
  token: z.string().min(16).max(128),
  protocolId: z.string().min(1),
});

export const savePublicInviteDraftSchema = z.object({
  token: z.string().min(16).max(128),
  protocolId: z.string().min(1),
  responses: z.record(z.string(), z.union([z.number(), z.string(), z.null()])),
});

export const submitPublicInviteSchema = savePublicInviteDraftSchema;

export type CreateProtocolInviteInput = z.infer<typeof createProtocolInviteSchema>;
export type SavePublicInviteDraftInput = z.infer<
  typeof savePublicInviteDraftSchema
>;
export type SubmitPublicInviteInput = z.infer<typeof submitPublicInviteSchema>;
