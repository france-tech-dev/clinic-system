import { PatientPricingType } from "../../../prisma/generated/prisma/enums";

export const PATIENT_PRICING_TYPES = [
  { id: PatientPricingType.SESSION, label: "Por sessão" },
  { id: PatientPricingType.PACKAGE, label: "Por pacote" },
] as const;

export function patientPricingTypeLabel(id: PatientPricingType): string {
  return PATIENT_PRICING_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function patientPriceFieldLabel(type: PatientPricingType): string {
  return type === PatientPricingType.PACKAGE
    ? "Valor do pacote (R$)"
    : "Valor por sessão (R$)";
}
