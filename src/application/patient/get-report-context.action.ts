"use server";

import { buildAnamnesePdfBlocks } from "@/domains/anamnese/_lib/pdf/build-blocks";
import { listPatientAnamneses } from "@/domains/anamnese/anamnese.service";
import { getCatalogAnamnese } from "@/domains/anamnese/forms";
import { listAssessmentsByPatient } from "@/domains/assessment/assessment.service";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { listEvolutionsByPatient } from "@/domains/evolution/evolution.service";
import type { EvolutionDTO } from "@/domains/evolution/evolution.types";
import { getPatientDetail } from "@/domains/patient/patient.service";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import { getPrintBranding, getProfessionalProfile } from "@/domains/settings/settings.service";
import type { PrintBranding, ProfessionalProfile } from "@/domains/settings/settings.types";
import { requirePermission } from "@/server/auth/permissions";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { z } from "zod";

const schema = z.object({
  patientId: z.string().min(1),
});

export type PatientReportContextDTO = {
  detail: PatientDetailDTO;
  assessments: AssessmentDTO[];
  evolutions: EvolutionDTO[];
  anamneseSections: PdfKeyValueSection[];
  branding: PrintBranding;
  professional: ProfessionalProfile;
};

export async function getPatientReportContextAction(
  input: unknown,
): Promise<ActionResult<PatientReportContextDTO>> {
  try {
    await requirePermission({ reports: ["read"] });
    const { patientId } = AppError.parse(schema, input);
    const { organizationId } = await requireOrgId();

    const [detail, assessments, evolutions, branding, professional, anamneseRecords] =
      await Promise.all([
        getPatientDetail(organizationId, patientId),
        listAssessmentsByPatient(organizationId, patientId),
        listEvolutionsByPatient(organizationId, patientId),
        getPrintBranding(organizationId),
        getProfessionalProfile(organizationId),
        listPatientAnamneses(organizationId, patientId),
      ]);

    if (!detail) throw new AppError("Paciente não encontrado");

    const anamneseSections = anamneseRecords.flatMap((row) => {
      const label = getCatalogAnamnese(row.formId)?.name ?? row.formId;
      return buildAnamnesePdfBlocks(row.formId, row.data).map((section) => ({
        ...section,
        title: `${label} — ${section.title}`,
      }));
    });

    return ok({
      detail,
      assessments: assessments ?? [],
      evolutions: evolutions ?? [],
      anamneseSections,
      branding,
      professional,
    });
  } catch (error) {
    return AppError.result(error);
  }
}
