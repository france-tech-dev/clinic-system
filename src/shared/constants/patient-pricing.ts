export const PATIENT_PRICING_TYPES = [
  { id: "sessao" as const, label: "Por sessão" },
  { id: "pacote" as const, label: "Por pacote" },
] as const;

export type PatientPricingTypeId =
  (typeof PATIENT_PRICING_TYPES)[number]["id"];

export function patientPricingTypeLabel(id: PatientPricingTypeId): string {
  return PATIENT_PRICING_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function patientPriceFieldLabel(type: PatientPricingTypeId): string {
  return type === "pacote" ? "Valor do pacote (R$)" : "Valor por sessão (R$)";
}
