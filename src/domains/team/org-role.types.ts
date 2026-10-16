import type { ClinicAction, ClinicResource } from "@/shared/lib/permissions";

export type OrgRolePermissionMatrix = Partial<
  Record<ClinicResource, ClinicAction[]>
>;

export type OrgRoleDTO = {
  id: string | null;
  role: string;
  label: string;
  permission: OrgRolePermissionMatrix;
  memberCount: number;
  /** OWNER / CLIENT — não apagar nem editar grants via UI de matriz. */
  system: boolean;
  /** ADMIN / MANAGER / MEMBER — padrão, editável. */
  preset: boolean;
};

export type OrgRoleOptionDTO = {
  value: string;
  label: string;
};
