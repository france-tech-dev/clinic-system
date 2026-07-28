import type { ReactNode } from "react";
import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModulePatientOption } from "@/shared/types/evaluation-module-patient";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/shared/types/professional";
import type { AnamneseSection } from "./field-types";

export type AnamneseRenderContext = {
  organizationId: string;
  patients: EvaluationModulePatientOption[];
  initialPatientId: string | null;
  branding: PrintBranding;
  professional: ProfessionalProfile;
};

/** Um formulário = metadados + schema + UI (único registo a manter). */
export type AnamneseFormModule = {
  id: string;
  name: string;
  description: string;
  professionId: HealthProfessionId;
  schema: AnamneseSection[];
  render: (ctx: AnamneseRenderContext) => Promise<ReactNode>;
};

export type CatalogAnamnese = {
  id: string;
  name: string;
  description: string;
  href: string;
};

export type ProfessionAnamneseCatalogItem = {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  forms: CatalogAnamnese[];
};
