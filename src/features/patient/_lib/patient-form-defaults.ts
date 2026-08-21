import { amountToBrlInput } from "@/shared/lib/money-utils";
import type { PatientDraftInput } from "@/features/patient/patient.schema";
import type {
  PatientPricingType,
  PatientSex,
} from "@/features/patient/patient.types";
import {
  PatientPricingType as PatientPricingTypeEnum,
  PatientSex as PatientSexEnum,
} from "../../../../prisma/generated/prisma/enums";

export const EMPTY_PATIENT_DRAFT: PatientDraftInput = {
  name: "",
  birthDate: "",
  sex: PatientSexEnum.NOT_INFORMED,
  notes: "",
  pricingType: PatientPricingTypeEnum.SESSION,
  priceInput: "",
};

export function patientDtoToDraft(patient: {
  name: string;
  birthDate: string | null;
  sex: PatientSex;
  notes: string;
  pricingType: PatientPricingType;
  price: number | null;
}): PatientDraftInput {
  return {
    name: patient.name,
    birthDate: patient.birthDate ?? "",
    sex: patient.sex,
    notes: patient.notes,
    pricingType: patient.pricingType,
    priceInput:
      patient.price === null || patient.price <= 0
        ? ""
        : amountToBrlInput(patient.price),
  };
}
