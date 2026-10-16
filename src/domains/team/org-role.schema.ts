import { CLINIC_ACTIONS } from "@/shared/lib/permissions";
import { z } from "zod";

const actionSchema = z.enum(CLINIC_ACTIONS);

const permissionSchema = z.record(z.string(), z.array(actionSchema));

export const createOrgRoleSchema = z.object({
  role: z
    .string()
    .trim()
    .min(2, "Informe o nome do papel")
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, "Use letras, números, _ ou - (sem espaços)"),
  permission: permissionSchema.optional().default({}),
});

export const updateOrgRoleSchema = z.object({
  roleId: z.string().min(1).optional(),
  roleName: z.string().trim().min(1),
  permission: permissionSchema,
});

export const deleteOrgRoleSchema = z.object({
  roleId: z.string().min(1).optional(),
  roleName: z.string().trim().min(1),
});

export type CreateOrgRoleInput = z.infer<typeof createOrgRoleSchema>;
export type UpdateOrgRoleInput = z.infer<typeof updateOrgRoleSchema>;
export type DeleteOrgRoleInput = z.infer<typeof deleteOrgRoleSchema>;
