import type {
  GuardianDraftInput,
  GuardianFormInput,
} from "@/features/guardian/guardian.schema";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";

/** Valores de input controlado (strings; null → ""). */
export type GuardianFormDraft = GuardianDraftInput;

export const EMPTY_GUARDIAN_DRAFT: GuardianFormDraft = {
  name: "",
  phone: "",
  email: "",
  cpf: "",
  address: "",
  zipCode: "",
  insurance: "particular",
  motherName: "",
  motherCpf: "",
  fatherName: "",
  fatherCpf: "",
  enablePortalAccess: true,
  password: DEFAULT_MEMBER_PASSWORD,
  confirmPassword: DEFAULT_MEMBER_PASSWORD,
};

export function guardianDtoToDraft(guardian: GuardianDTO): GuardianFormDraft {
  return {
    name: guardian.name,
    phone: guardian.phone ?? "",
    email: guardian.email ?? "",
    cpf: guardian.cpf ?? "",
    address: guardian.address ?? "",
    zipCode: guardian.zipCode ?? "",
    insurance: guardian.insurance || "particular",
    motherName: guardian.motherName ?? "",
    motherCpf: guardian.motherCpf ?? "",
    fatherName: guardian.fatherName ?? "",
    fatherCpf: guardian.fatherCpf ?? "",
    enablePortalAccess: false,
    password: DEFAULT_MEMBER_PASSWORD,
    confirmPassword: DEFAULT_MEMBER_PASSWORD,
  };
}

export function guardianDraftToCreateInput(draft: GuardianFormDraft) {
  return {
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    cpf: draft.cpf,
    address: draft.address,
    zipCode: draft.zipCode,
    documentImageUrl: "",
    insurance: draft.insurance.trim() || "particular",
    motherName: draft.motherName,
    motherCpf: draft.motherCpf,
    fatherName: draft.fatherName,
    fatherCpf: draft.fatherCpf,
    enablePortalAccess: draft.enablePortalAccess,
    password: draft.password,
    confirmPassword: draft.confirmPassword,
  };
}

export function guardianDraftToForm(
  draft: GuardianFormDraft,
): GuardianFormInput {
  return {
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    cpf: draft.cpf,
    address: draft.address,
    zipCode: draft.zipCode,
    documentImageUrl: "",
    insurance: draft.insurance.trim() || "particular",
    motherName: draft.motherName,
    motherCpf: draft.motherCpf,
    fatherName: draft.fatherName,
    fatherCpf: draft.fatherCpf,
  };
}
