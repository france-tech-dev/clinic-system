import { memberToProfessionalProfile } from "@/shared/types/professional";
import type {
  EvaluationDomain,
  EvaluationDTO,
  PatientDTO,
  PatientPricingType,
  PatientStatus,
  RoteiroNoteDTO,
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

export function toPatientDTO(row: {
  id: string;
  name: string;
  notes: string;
  status: PatientStatus;
  pricingType: PatientPricingType;
  priceCents: number | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { evaluations: number; sessionNotes: number };
  evaluations?: { date: string }[];
}): PatientDTO {
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    status: row.status,
    pricingType: row.pricingType,
    priceCents: row.priceCents,
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
  memberId?: string | null;
  date: string;
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
    memberId: row.memberId ?? null,
    professionalName: row.member?.user.name?.trim() || null,
    date: row.date,
    status: row.status,
    atividades: row.atividades,
    observacoes: row.observacoes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

export function parseAnamneseData(
  raw: string | undefined,
): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}
