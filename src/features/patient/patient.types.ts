export type PatientStatus = "ativo" | "alta" | "pausado";
export type SessionNoteStatus = "compareceu" | "faltou" | "cancelado";
export type PatientPricingType = "sessao" | "pacote";

export type PatientDTO = {
  id: string;
  name: string;
  notes: string;
  status: PatientStatus;
  pricingType: PatientPricingType;
  priceCents: number | null;
  createdAt: string;
  updatedAt: string;
  evaluationsCount?: number;
  sessionsCount?: number;
  lastEvaluationDate?: string | null;
};

export type EvaluationDomain = {
  categoryId: string;
  score: number;
  note: string;
};

export type EvaluationDTO = {
  id: string;
  patientId: string;
  memberId: string | null;
  professionalName: string | null;
  /** Perfil CREFITO do autor (Member.metadata), para PDF. */
  authorProfessional: {
    nome: string;
    registro: string;
    clinica: string;
  } | null;
  tipo: string;
  date: string;
  queixa: string;
  historia: string;
  domains: EvaluationDomain[];
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
  createdAt: string;
  updatedAt: string;
};

export type SessionNoteDTO = {
  id: string;
  patientId: string;
  memberId: string | null;
  professionalName: string | null;
  date: string;
  status: SessionNoteStatus;
  atividades: string;
  observacoes: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanItemDTO = {
  id: string;
  patientId: string;
  exerciseId: string;
  exerciseTitle: string;
  categoryId: string;
  level: string;
  objective: string;
  createdAt: string;
};

export type RoteiroNoteDTO = {
  id: string;
  patientId: string;
  roteiroId: string;
  categoryTick: string;
  notes: string;
  updatedAt: string;
};

export type PatientDetailDTO = {
  patient: PatientDTO;
  planItems: PlanItemDTO[];
  evaluations: EvaluationDTO[];
  anamneseData: Record<string, unknown>;
  sessionNotes: SessionNoteDTO[];
  roteiroNotes: RoteiroNoteDTO[];
};
