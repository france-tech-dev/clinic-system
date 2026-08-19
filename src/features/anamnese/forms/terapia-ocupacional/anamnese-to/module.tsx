import { getAnamnese } from "@/features/anamnese/anamnese.service";
import type { AnamneseFormModule, AnamneseRenderContext } from "../../types";
import { ANAMNESE_SCHEMA } from "./schema";
import { AnamneseFormClient } from "./components/anamnese-form-client";

export const ANAMNESE_TO_FORM_ID = "anamnese-to";

const FORM_NAME = "Anamnese de Terapia Ocupacional";
const FORM_DESCRIPTION =
  "Formulário de anamnese ocupacional (AVDs, sensorial, rotina e expectativas).";

async function renderAnamneseTo({
  organizationId,
  patients,
  initialPatientId,
  branding,
  professional,
  canWrite,
}: AnamneseRenderContext) {
  const initialAnamnese = initialPatientId
    ? await getAnamnese(organizationId, initialPatientId, ANAMNESE_TO_FORM_ID)
    : null;

  return (
    <AnamneseFormClient
      formId={ANAMNESE_TO_FORM_ID}
      formTitle={FORM_NAME}
      schema={ANAMNESE_SCHEMA}
      patients={patients}
      initialPatientId={initialPatientId}
      initialAnamnese={initialAnamnese}
      branding={branding}
      professional={professional}
      canWrite={canWrite}
    />
  );
}

/** Módulo único: catálogo + schema + UI. */
export const anamneseToForm: AnamneseFormModule = {
  id: ANAMNESE_TO_FORM_ID,
  name: FORM_NAME,
  description: FORM_DESCRIPTION,
  professionId: "terapeuta_ocupacional",
  schema: ANAMNESE_SCHEMA,
  render: renderAnamneseTo,
};
