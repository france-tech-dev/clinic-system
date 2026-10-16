"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { auth } from "@/shared/lib/auth";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createOrgRoleSchema, deleteOrgRoleSchema, updateOrgRoleSchema } from "./org-role.schema";
import {
  assertCreatableOrgRoleSlug,
  assertDeletableOrgRole,
  assertUpdatableOrgRole,
  getOrgRoleDto,
  listOrgRoles,
} from "./org-role.service";
import type { OrgRoleDTO } from "./org-role.types";

function revalidateTeamPaths() {
  revalidatePath(paths.profissionais);
  revalidatePath("/", "layout");
}

export async function listOrgRolesAction(): Promise<ActionResult<OrgRoleDTO[]>> {
  try {
    await requirePermission({ team: ["read"] });
    const { organizationId } = await requireOrgId();
    const data = await listOrgRoles(organizationId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createOrgRoleAction(input: unknown): Promise<ActionResult<OrgRoleDTO>> {
  try {
    await requirePermission({ team: ["create"] });
    const payload = AppError.parse(createOrgRoleSchema, input);
    const { organizationId } = await requireOrgWrite();
    assertCreatableOrgRoleSlug(payload.role);

    await auth.api.createOrgRole({
      headers: await headers(),
      body: {
        organizationId,
        role: payload.role,
        permission: payload.permission,
      },
    });

    const data = await getOrgRoleDto(organizationId, payload.role);
    revalidateTeamPaths();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateOrgRoleAction(input: unknown): Promise<ActionResult<OrgRoleDTO>> {
  try {
    await requirePermission({ team: ["update"] });
    const payload = AppError.parse(updateOrgRoleSchema, input);
    const { organizationId } = await requireOrgWrite();
    assertUpdatableOrgRole(payload.roleName);

    await auth.api.updateOrgRole({
      headers: await headers(),
      body: {
        organizationId,
        ...(payload.roleId ? { roleId: payload.roleId } : { roleName: payload.roleName }),
        data: {
          permission: payload.permission,
        },
      },
    });

    const data = await getOrgRoleDto(organizationId, payload.roleName);
    revalidateTeamPaths();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteOrgRoleAction(input: unknown): Promise<ActionResult<{ ok: true }>> {
  try {
    await requirePermission({ team: ["delete"] });
    const payload = AppError.parse(deleteOrgRoleSchema, input);
    const { organizationId } = await requireOrgWrite();
    await assertDeletableOrgRole(organizationId, payload);

    await auth.api.deleteOrgRole({
      headers: await headers(),
      body: {
        organizationId,
        ...(payload.roleId ? { roleId: payload.roleId } : { roleName: payload.roleName }),
      },
    });

    revalidateTeamPaths();
    return ok({ ok: true });
  } catch (error) {
    return AppError.result(error);
  }
}
