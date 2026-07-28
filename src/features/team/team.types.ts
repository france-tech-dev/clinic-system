export type TeamMemberStatus = "active" | "inactive";

export type TeamMemberDTO = {
  id: string;
  userId: string;
  role: string;
  status: TeamMemberStatus;
  profession: string | null;
  registration: string | null;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
};

export type CreatedProfessionalDTO = {
  memberId: string;
  userId: string;
  email: string;
  mustChangePassword: boolean;
};
