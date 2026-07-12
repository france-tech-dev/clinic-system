import { patientRepository } from "./patient.repository";
import type {
  EvaluationFormInput,
  PatientFormInput,
  RoteiroNoteSaveInput,
  SessionFormInput,
} from "./patient.schema";
import type {
  EvaluationDomain,
  EvaluationDTO,
  PatientDetailDTO,
  PatientDTO,
  PatientPricingType,
  PatientStatus,
  PlanItemDTO,
  RoteiroNoteDTO,
  SessionNoteDTO,
  SessionNoteStatus,
} from "./patient.types";

function toPatientDTO(row: {
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

function parseDomains(raw: string): EvaluationDomain[] {
  try {
    return JSON.parse(raw) as EvaluationDomain[];
  } catch {
    return [];
  }
}

function toEvaluationDTO(row: {
  id: string;
  patientId: string;
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
}): EvaluationDTO {
  return {
    id: row.id,
    patientId: row.patientId,
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

function toSessionDTO(row: {
  id: string;
  patientId: string;
  date: string;
  status: SessionNoteStatus;
  atividades: string;
  observacoes: string;
  createdAt: Date;
  updatedAt: Date;
}): SessionNoteDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    date: row.date,
    status: row.status,
    atividades: row.atividades,
    observacoes: row.observacoes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPlanItemDTO(row: {
  id: string;
  patientId: string;
  exerciseId: string;
  createdAt: Date;
  exercise: {
    title: string;
    categoryId: string;
    level: string;
    objective: string;
  };
}): PlanItemDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    exerciseId: row.exerciseId,
    exerciseTitle: row.exercise.title,
    categoryId: row.exercise.categoryId,
    level: row.exercise.level,
    objective: row.exercise.objective,
    createdAt: row.createdAt.toISOString(),
  };
}

function toRoteiroNoteDTO(row: {
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

export async function listPatients(
  organizationId: string,
  opts?: { status?: PatientStatus | null; search?: string },
) {
  const rows = await patientRepository.findMany(organizationId, opts);
  return rows.map(toPatientDTO);
}

export async function getPatientDetail(
  organizationId: string,
  id: string,
): Promise<PatientDetailDTO | null> {
  const row = await patientRepository.findById(organizationId, id);
  if (!row) return null;

  let anamneseData: Record<string, unknown> = {};
  if (row.anamnese?.data) {
    try {
      anamneseData = JSON.parse(row.anamnese.data) as Record<string, unknown>;
    } catch {
      anamneseData = {};
    }
  }

  return {
    patient: toPatientDTO(row),
    planItems: row.planItems.map(toPlanItemDTO),
    evaluations: row.evaluations.map(toEvaluationDTO),
    anamneseData,
    sessionNotes: row.sessionNotes.map(toSessionDTO),
    roteiroNotes: row.roteiroNotes.map(toRoteiroNoteDTO),
  };
}

export async function createPatient(
  organizationId: string,
  data: PatientFormInput,
) {
  const row = await patientRepository.create(organizationId, data);
  return toPatientDTO(row);
}

export async function updatePatient(
  organizationId: string,
  id: string,
  data: PatientFormInput,
) {
  const row = await patientRepository.update(organizationId, id, data);
  return row ? toPatientDTO(row) : null;
}

export async function setPatientStatus(
  organizationId: string,
  id: string,
  status: PatientStatus,
) {
  const row = await patientRepository.updateStatus(organizationId, id, status);
  return row ? toPatientDTO(row) : null;
}

export async function deletePatient(organizationId: string, id: string) {
  const row = await patientRepository.delete(organizationId, id);
  return row ? toPatientDTO(row) : null;
}

export async function assignExerciseToPatient(
  organizationId: string,
  patientId: string,
  exerciseId: string,
) {
  const row = await patientRepository.assignExercise(
    organizationId,
    patientId,
    exerciseId,
  );
  return row ? toPlanItemDTO(row) : null;
}

export async function removePlanItem(
  organizationId: string,
  planItemId: string,
) {
  return patientRepository.removePlanItem(organizationId, planItemId);
}

export async function createEvaluation(
  organizationId: string,
  data: EvaluationFormInput,
) {
  const row = await patientRepository.createEvaluation(organizationId, data);
  return row ? toEvaluationDTO(row) : null;
}

export async function updateEvaluation(
  organizationId: string,
  id: string,
  data: EvaluationFormInput,
) {
  const row = await patientRepository.updateEvaluation(
    organizationId,
    id,
    data,
  );
  return row ? toEvaluationDTO(row) : null;
}

export async function deleteEvaluation(organizationId: string, id: string) {
  return patientRepository.deleteEvaluation(organizationId, id);
}

export async function saveAnamnese(
  organizationId: string,
  patientId: string,
  data: Record<string, unknown>,
) {
  return patientRepository.upsertAnamnese(organizationId, patientId, data);
}

export async function createSessionNote(
  organizationId: string,
  data: SessionFormInput,
) {
  const row = await patientRepository.createSession(organizationId, data);
  return row ? toSessionDTO(row) : null;
}

export async function updateSessionNote(
  organizationId: string,
  id: string,
  data: SessionFormInput,
) {
  const row = await patientRepository.updateSession(organizationId, id, data);
  return row ? toSessionDTO(row) : null;
}

export async function deleteSessionNote(organizationId: string, id: string) {
  return patientRepository.deleteSession(organizationId, id);
}

export async function saveRoteiroNote(
  organizationId: string,
  data: RoteiroNoteSaveInput,
) {
  const row = await patientRepository.upsertRoteiroNote(organizationId, data);
  return row ? toRoteiroNoteDTO(row) : null;
}
