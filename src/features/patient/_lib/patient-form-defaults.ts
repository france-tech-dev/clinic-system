import type { PatientDraftInput } from "@/features/patient/patient.schema";
import { formatPatientPriceInput } from "@/features/patient/_lib/patient-price-input";
import type {
  PatientPricingType,
  PatientSex,
} from "@/features/patient/patient.types";

export const EMPTY_PATIENT_DRAFT: PatientDraftInput = {
  name: "",
  birthDate: "",
  sex: "nao_informado",
  notes: "",
  pricingType: "sessao",
  priceInput: "",
};

export function patientDtoToDraft(patient: {
  name: string;
  birthDate: string | null;
  sex: PatientSex;
  notes: string;
  pricingType: PatientPricingType;
  priceCents: number | null;
}): PatientDraftInput {
  return {
    name: patient.name,
    birthDate: patient.birthDate ?? "",
    sex: patient.sex,
    notes: patient.notes,
    pricingType: patient.pricingType,
    priceInput: formatPatientPriceInput(patient.priceCents),
  };
}
