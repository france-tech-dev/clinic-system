import type {
  MemberStatus,
  PatientPricingType,
  PatientSex,
  PatientStatus,
  SessionNoteStatus,
} from "../../../prisma/generated/prisma/enums";

export type {
  PatientPricingType,
  PatientSex,
  PatientStatus,
  SessionNoteStatus,
};

/** Resumo do responsável embutido no PatientDTO (sem importar features/guardian). */
export type PatientGuardianEmbed = {
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
  userId: string | null;
  hasPortalAccess: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientMemberEmbed = {
  id: string;
  name: string;
  imageUrl: string | null;
};

/** Profissional da clínica para atribuir a um paciente (sem importar features/team). */
export type AssignableMemberOption = {
  id: string;
  name: string;
  status: MemberStatus;
  profession: string | null;
};

export type PatientDTO = {
  id: string;
  name: string;
  birthDate: string | null;
  sex: PatientSex;
  photoUrl: string | null;
  notes: string;
  status: PatientStatus;
  pricingType: PatientPricingType;
  price: number | null;
  guardianId: string;
  guardian?: PatientGuardianEmbed;
  members: PatientMemberEmbed[];
  createdAt: string;
  updatedAt: string;
  clinicalEvaluationsCount?: number;
  sessionsCount?: number;
  lastClinicalEvaluationDate?: string | null;
};

export type ClinicalEvaluationDomain = {
  categoryId: string;
  score: number;
  note: string;
};

export type ClinicalEvaluationDTO = {
  id: string;
  patientId: string;
  memberId: string | null;
  professionalName: string | null;
  /** Perfil CREFITO do autor (Member.metadata), para PDF. */
  authorProfessional: {
    name: string;
    registration: string;
    clinic: string;
  } | null;
  type: string;
  date: string;
  complaint: string;
  history: string;
  domains: ClinicalEvaluationDomain[];
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
  createdAt: string;
  updatedAt: string;
};

export type SessionNoteDTO = {
  id: string;
  patientId: string;
  appointmentId: string | null;
  memberId: string | null;
  professionalName: string | null;
  date: string;
  time: string;
  status: SessionNoteStatus;
  activities: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
};

/** Agendamento do paciente para vincular a uma evolução. */
export type SessionLinkableAppointmentDTO = {
  id: string;
  date: string;
  time: string;
  status: string;
  professionalName: string | null;
  /** Id da evolução já ligada, se houver. */
  sessionNoteId: string | null;
};

export type PatientDetailDTO = {
  patient: PatientDTO;
  clinicalEvaluations: ClinicalEvaluationDTO[];
  sessionNotes: SessionNoteDTO[];
  appointments: SessionLinkableAppointmentDTO[];
};
