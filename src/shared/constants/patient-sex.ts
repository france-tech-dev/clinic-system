import { PatientSex } from "@prisma/enums";

export const PATIENT_SEX_LABEL = {
  [PatientSex.FEMALE]: "Feminino",
  [PatientSex.MALE]: "Masculino",
  [PatientSex.OTHER]: "Outro",
  [PatientSex.NOT_INFORMED]: "Não informado",
} as const satisfies Record<PatientSex, string>;

export function patientSexLabel(sex: PatientSex): string {
  return PATIENT_SEX_LABEL[sex];
}

export const PATIENT_SEXES = [
  PatientSex.FEMALE,
  PatientSex.MALE,
  PatientSex.OTHER,
  PatientSex.NOT_INFORMED,
] as const;
