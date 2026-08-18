import { memberToProfessionalProfile } from "@/shared/types/professional";
import type {
  ClinicalEvaluationDomain,
  ClinicalEvaluationDTO,
  PatientDTO,
  PatientGuardianEmbed,
  PatientPricingType,
  PatientSex,
  PatientStatus,
  SessionLinkableAppointmentDTO,
  SessionNoteDTO,
  SessionNoteStatus,
} from "../patient.types";

export function parseDomains(raw: string): ClinicalEvaluationDomain[] {
  try {
    return JSON.parse(raw) as ClinicalEvaluationDomain[];
  } catch {
    return [];
  }
}

export function formatBirthDateParam(
  value: Date | null | undefined,
): string | null {
  if (!value) return null;
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseBirthDateParam(
  value: string | null | undefined,
): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day));
}

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
  _count?: { clinicalEvaluations: number; sessionNotes: number };
  clinicalEvaluations?: { date: string }[];
}): PatientDTO {
  return {
    id: row.id,
    name: row.name,
    birthDate: formatBirthDateParam(row.birthDate),
    sex: row.sex ?? "not_informed",
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
    clinicalEvaluationsCount: row._count?.clinicalEvaluations,
    sessionsCount: row._count?.sessionNotes,
    lastClinicalEvaluationDate: row.clinicalEvaluations?.[0]?.date ?? null,
  };
}

export function toClinicalEvaluationDTO(row: {
  id: string;
  patientId: string;
  memberId?: string | null;
  type: string;
  date: string;
  complaint: string;
  history: string;
  domains: string;
  goals: string;
  interventions: string;
  diagnosis: string;
  referredBy: string;
  familyContext: string;
  previousLevel: string;
  medications: string;
  precautions: string;
  equipment: string;
  frequency: string;
  dischargeCriteria: string;
  createdAt: Date;
  updatedAt: Date;
  member?: {
    metadata?: string | null;
    registration?: string | null;
    user: { name: string | null };
  } | null;
}): ClinicalEvaluationDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    memberId: row.memberId ?? null,
    professionalName: row.member?.user.name?.trim() || null,
    authorProfessional: row.member
      ? memberToProfessionalProfile(
          row.member.metadata,
          row.member.user.name,
          row.member.registration,
        )
      : null,
    type: row.type,
    date: row.date,
    complaint: row.complaint,
    history: row.history,
    domains: parseDomains(row.domains),
    goals: row.goals,
    interventions: row.interventions,
    diagnosis: row.diagnosis,
    referredBy: row.referredBy,
    familyContext: row.familyContext,
    previousLevel: row.previousLevel,
    medications: row.medications,
    precautions: row.precautions,
    equipment: row.equipment,
    frequency: row.frequency,
    dischargeCriteria: row.dischargeCriteria,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toSessionDTO(row: {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  memberId?: string | null;
  date: string;
  time: string;
  status: SessionNoteStatus;
  activities: string;
  observations: string;
  createdAt: Date;
  updatedAt: Date;
  member?: { user: { name: string | null } } | null;
}): SessionNoteDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    appointmentId: row.appointmentId ?? null,
    memberId: row.memberId ?? null,
    professionalName: row.member?.user.name?.trim() || null,
    date: row.date,
    time: row.time ?? "",
    status: row.status,
    activities: row.activities,
    observations: row.observations,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toLinkableAppointmentDTO(row: {
  id: string;
  date: string;
  time: string;
  status: string;
  sessionNote?: { id: string } | null;
  member?: { user: { name: string | null } } | null;
}): SessionLinkableAppointmentDTO {
  return {
    id: row.id,
    date: row.date,
    time: row.time ?? "",
    status: row.status,
    professionalName: row.member?.user.name?.trim() || null,
    sessionNoteId: row.sessionNote?.id ?? null,
  };
}
