import { memberToProfessionalProfile } from "@/shared/types/professional";
import type {
  EvaluationDomain,
  EvaluationDTO,
  PatientDTO,
  PatientGuardianEmbed,
  PatientPricingType,
  PatientSex,
  PatientStatus,
  RoteiroNoteDTO,
  SessionLinkableAppointmentDTO,
  SessionNoteDTO,
  SessionNoteStatus,
} from "../patient.types";

export function parseDomains(raw: string): EvaluationDomain[] {
  try {
    return JSON.parse(raw) as EvaluationDomain[];
  } catch {
    return [];
  }
}

export function formatBirthDateParam(value: Date | null | undefined): string | null {
  if (!value) return null;
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseBirthDateParam(value: string | null | undefined): Date | null {
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
  priceCents: number | null;
  guardianId: string;
  guardian?: Parameters<typeof toPatientGuardianEmbed>[0];
  createdAt: Date;
  updatedAt: Date;
  _count?: { evaluations: number; sessionNotes: number };
  evaluations?: { date: string }[];
}): PatientDTO {
  return {
    id: row.id,
    name: row.name,
    birthDate: formatBirthDateParam(row.birthDate),
    sex: row.sex ?? "nao_informado",
    photoUrl: row.photoUrl ?? null,
    notes: row.notes,
    status: row.status,
    pricingType: row.pricingType,
    priceCents: row.priceCents,
    guardianId: row.guardianId,
    guardian: row.guardian ? toPatientGuardianEmbed(row.guardian) : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    evaluationsCount: row._count?.evaluations,
    sessionsCount: row._count?.sessionNotes,
    lastEvaluationDate: row.evaluations?.[0]?.date ?? null,
  };
}

export function toEvaluationDTO(row: {
  id: string;
  patientId: string;
  memberId?: string | null;
  tipo: string;
  date: string;
  queixa: string;
  historia: string;
  domains: string;
  objetivos: string;
  condutas: string;
  diagnostico: string;
  encaminhadoPor: string;
  contextoFamiliar: string;
  nivelPrevio: string;
  medicacoes: string;
  precaucoes: string;
  equipamentos: string;
  frequencia: string;
  criteriosAlta: string;
  createdAt: Date;
  updatedAt: Date;
  member?: {
    metadata?: string | null;
    registro?: string | null;
    user: { name: string | null };
  } | null;
}): EvaluationDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    memberId: row.memberId ?? null,
    professionalName: row.member?.user.name?.trim() || null,
    authorProfessional: row.member
      ? memberToProfessionalProfile(
          row.member.metadata,
          row.member.user.name,
          row.member.registro,
        )
      : null,
    tipo: row.tipo,
    date: row.date,
    queixa: row.queixa,
    historia: row.historia,
    domains: parseDomains(row.domains),
    objetivos: row.objetivos,
    condutas: row.condutas,
    diagnostico: row.diagnostico,
    encaminhadoPor: row.encaminhadoPor,
    contextoFamiliar: row.contextoFamiliar,
    nivelPrevio: row.nivelPrevio,
    medicacoes: row.medicacoes,
    precaucoes: row.precaucoes,
    equipamentos: row.equipamentos,
    frequencia: row.frequencia,
    criteriosAlta: row.criteriosAlta,
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
  atividades: string;
  observacoes: string;
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
    atividades: row.atividades,
    observacoes: row.observacoes,
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

export function toRoteiroNoteDTO(row: {
  id: string;
  patientId: string;
  roteiroId: string;
  categoryTick: string;
  notes: string;
  updatedAt: Date;
}): RoteiroNoteDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    roteiroId: row.roteiroId,
    categoryTick: row.categoryTick,
    notes: row.notes,
    updatedAt: row.updatedAt.toISOString(),
  };
}
