import {
  DEFAULT_ORG_ROLE_SLUGS,
  MEMBER_ROLE_LABEL,
  memberRoleLabel,
  SYSTEM_ROLE_SLUGS,
} from "@/shared/constants/member-role";
import { Role } from "@prisma/enums";
import { PRESET_ROLE_PERMISSIONS } from "./_lib/default-org-role-permissions";
import { orgRoleRepository } from "./org-role.repository";
import type { DeleteOrgRoleInput } from "./org-role.schema";
import type { OrgRoleDTO, OrgRoleOptionDTO, OrgRolePermissionMatrix } from "./org-role.types";

const PRESET_PANEL_ROLES = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.MEMBER] as const;

function parsePermission(raw: unknown): OrgRolePermissionMatrix {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as OrgRolePermissionMatrix;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") {
    return raw as OrgRolePermissionMatrix;
  }
  return {};
}

export async function ensureDefaultOrgRoles(organizationId: string): Promise<void> {
  await orgRoleRepository.ensureDefaults(organizationId);
}

export async function listOrgRoles(organizationId: string): Promise<OrgRoleDTO[]> {
  await ensureDefaultOrgRoles(organizationId);

  const [counts, dynamicRows] = await Promise.all([
    orgRoleRepository.countMembersByRole(organizationId),
    orgRoleRepository.findMany(organizationId),
  ]);

  const bySlug = new Map(
    dynamicRows.map((row) => [
      row.role,
      {
        id: row.id,
        role: row.role,
        permission: parsePermission(row.permission),
      },
    ]),
  );

  const result: OrgRoleDTO[] = [];

  for (const slug of PRESET_PANEL_ROLES) {
    const dyn = bySlug.get(slug);
    const system = (SYSTEM_ROLE_SLUGS as readonly string[]).includes(slug);
    result.push({
      id: dyn?.id ?? null,
      role: slug,
      label: MEMBER_ROLE_LABEL[slug],
      permission: dyn?.permission ?? PRESET_ROLE_PERMISSIONS[slug] ?? {},
      memberCount: counts.get(slug) ?? 0,
      system,
      preset: true,
    });
    bySlug.delete(slug);
  }

  for (const [slug, dyn] of bySlug) {
    if (slug === Role.CLIENT) continue;
    result.push({
      id: dyn.id,
      role: slug,
      label: memberRoleLabel(slug),
      permission: dyn.permission,
      memberCount: counts.get(slug) ?? 0,
      system: false,
      preset: false,
    });
  }

  return result;
}

export function toAssignableRoleOptions(roles: OrgRoleDTO[]): OrgRoleOptionDTO[] {
  return roles
    .filter((r) => r.role !== Role.OWNER && r.role !== Role.CLIENT)
    .map((r) => ({ value: r.role, label: r.label }));
}

export async function listAssignableRoleOptions(
  organizationId: string,
): Promise<OrgRoleOptionDTO[]> {
  return toAssignableRoleOptions(await listOrgRoles(organizationId));
}

export function assertCreatableOrgRoleSlug(role: string) {
  const reserved = new Set<string>([...PRESET_PANEL_ROLES, Role.CLIENT]);
  if (reserved.has(role)) {
    throw new Error("Este nome de papel já está reservado.");
  }
}

export function assertUpdatableOrgRole(roleName: string) {
  if ((SYSTEM_ROLE_SLUGS as readonly string[]).includes(roleName)) {
    throw new Error("Não é possível alterar permissões deste papel.");
  }
}

export async function assertDeletableOrgRole(organizationId: string, input: DeleteOrgRoleInput) {
  if (
    (SYSTEM_ROLE_SLUGS as readonly string[]).includes(input.roleName) ||
    (DEFAULT_ORG_ROLE_SLUGS as readonly string[]).includes(input.roleName)
  ) {
    throw new Error("Não é possível excluir papéis padrão do sistema.");
  }

  const members = await orgRoleRepository.countMembersWithRole(organizationId, input.roleName);
  if (members > 0) {
    throw new Error("Há membros com este papel. Reatribua-os antes de excluir.");
  }
}

export async function getOrgRoleDto(organizationId: string, roleName: string): Promise<OrgRoleDTO> {
  const roles = await listOrgRoles(organizationId);
  const found = roles.find((r) => r.role === roleName);
  if (!found) throw new Error("Papel não encontrado.");
  return found;
}
