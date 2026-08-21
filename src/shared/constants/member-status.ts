import { MemberStatus } from "../../../prisma/generated/prisma/enums";

export const MEMBER_STATUS_LABEL = {
  [MemberStatus.ACTIVE]: "Ativo",
  [MemberStatus.INACTIVE]: "Inativo",
} as const satisfies Record<MemberStatus, string>;

export function memberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABEL[status];
}

export const MEMBER_STATUS_OPTIONS = [
  { value: MemberStatus.ACTIVE, label: MEMBER_STATUS_LABEL.ACTIVE },
  { value: MemberStatus.INACTIVE, label: MEMBER_STATUS_LABEL.INACTIVE },
] as const;
