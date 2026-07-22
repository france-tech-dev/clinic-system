export type GuardianDTO = {
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

export type CreatedGuardianDTO = GuardianDTO & {
  mustChangePassword: boolean;
};
