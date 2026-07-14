import type { ProfessionalProfile } from "@/shared/types/professional";

export type {
  ProfessionalProfile,
  PrintBranding,
  MemberProfessionalStored,
} from "@/shared/types/professional";
export {
  EMPTY_PROFESSIONAL,
  formatProfessionalSignature,
  memberToProfessionalProfile,
  parseMemberProfessionalMetadata,
  resolveReportProfessional,
  serializeMemberProfessionalMetadata,
} from "@/shared/types/professional";

export type ClinicSettings = {
  professional: ProfessionalProfile;
};
