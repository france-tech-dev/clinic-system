import { formatCivilDateParam } from "@/shared/lib/date/civil-date-param";
import { PatientSex } from "@prisma/enums";
import type {
  PatientDTO,
  PatientGuardianEmbed,
  PatientPricingType,
  PatientStatus,
} from "../patient.types";

export function toPatientGuardianEmbed(row: {
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
}): PatientGuardianEmbed {
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

export function toPatientDTO(row: {
  id: string;
  name: string;
  birthDate?: Date | null;
  sex?: PatientSex;
  photoUrl?: string | null;
  notes: string;
  status: PatientStatus;
  pricingType: PatientPricingType;
  price: { toString(): string } | number | null;
  guardianId: string;
  guardian?: Parameters<typeof toPatientGuardianEmbed>[0];
  members?: {
    id: string;
    user: { name: string | null; image?: string | null };
  }[];
  createdAt: Date;
  updatedAt: Date;
  _count?: { assessments: number; evolutions: number };
  assessments?: { date: string }[];
}): PatientDTO {
  return {
    id: row.id,
    name: row.name,
    birthDate: formatCivilDateParam(row.birthDate),
    sex: row.sex ?? PatientSex.NOT_INFORMED,
    photoUrl: row.photoUrl ?? null,
    notes: row.notes,
    status: row.status,
    pricingType: row.pricingType,
    price: row.price == null ? null : Number(row.price),
    guardianId: row.guardianId,
    guardian: row.guardian ? toPatientGuardianEmbed(row.guardian) : undefined,
    members: (row.members ?? []).map((member) => ({
      id: member.id,
      name: member.user.name?.trim() || "Membro",
      imageUrl: member.user.image?.trim() || null,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assessmentsCount: row._count?.assessments,
    evolutionsCount: row._count?.evolutions,
    lastAssessmentDate: row.assessments?.[0]?.date ?? null,
  };
}
