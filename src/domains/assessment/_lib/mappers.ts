import { memberToProfessionalProfile } from "@/shared/types/professional";
import type { AssessmentDomain, AssessmentDTO } from "../assessment.types";

export function parseDomains(raw: string): AssessmentDomain[] {
  try {
    return JSON.parse(raw) as AssessmentDomain[];
  } catch {
    return [];
  }
}

export function toAssessmentDTO(row: {
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
}): AssessmentDTO {
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
