import type {
  MemberStatus,
  PatientPricingType,
  PatientSex,
  PatientStatus,
} from "@prisma/enums";

export type { PatientPricingType, PatientSex, PatientStatus };

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
  assessmentsCount?: number;
  evolutionsCount?: number;
  lastAssessmentDate?: string | null;
};

export type PatientDetailDTO = {
  patient: PatientDTO;
};
