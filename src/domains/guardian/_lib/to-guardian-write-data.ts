import type { GuardianFormInput } from "../guardian.schema";

export function toGuardianWriteData(data: GuardianFormInput) {
  return {
    name: data.name,
    phone: data.phone ?? "",
    email: data.email ?? null,
    cpf: data.cpf ?? null,
    address: data.address ?? "",
    zipCode: data.zipCode ?? "",
    documentImageUrl: data.documentImageUrl ?? null,
    insurance: data.insurance ?? "particular",
    motherName: data.motherName ?? "",
    motherCpf: data.motherCpf ?? null,
    fatherName: data.fatherName ?? "",
    fatherCpf: data.fatherCpf ?? null,
  };
}
