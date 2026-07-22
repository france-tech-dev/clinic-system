import type { GuardianDTO } from "../guardian.types";

export function toGuardianDTO(row: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cpf: string | null;
  address: string;
  zipCode: string;
  documentImageUrl: string | null;
  insurance: string;
  motherName: string;
  motherCpf: string | null;
  fatherName: string;
  fatherCpf: string | null;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): GuardianDTO {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    cpf: row.cpf,
    address: row.address,
    zipCode: row.zipCode,
    documentImageUrl: row.documentImageUrl,
    insurance: row.insurance,
    motherName: row.motherName,
    motherCpf: row.motherCpf,
    fatherName: row.fatherName,
    fatherCpf: row.fatherCpf,
    userId: row.userId ?? null,
    hasPortalAccess: Boolean(row.userId),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
