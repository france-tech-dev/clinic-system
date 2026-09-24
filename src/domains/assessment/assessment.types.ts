export type AssessmentDomain = {
  categoryId: string;
  score: number;
  note: string;
};

export type AssessmentDTO = {
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
  domains: AssessmentDomain[];
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
