export type TeamMemberStatus = "active" | "inactive";

export type TeamMemberDTO = {
  id: string;
  userId: string;
  role: string;
  status: TeamMemberStatus;
  profession: string | null;
  registration: string | null;
  name: string;
  imageUrl: string | null;
  email: string;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
  patients: TeamMemberPatientEmbed[];
};

export type TeamMemberPatientEmbed = {
  id: string;
  name: string;
  photoUrl: string | null;
};

/** Paciente da clínica para atribuir a um profissional (sem importar a feature patient). */
export type AssignablePatientOption = {
  id: string;
  name: string;
  photoUrl: string | null;
  statusLabel: string;
};

export type CreatedProfessionalDTO = {
  memberId: string;
  userId: string;
  email: string;
  mustChangePassword: boolean;
};
