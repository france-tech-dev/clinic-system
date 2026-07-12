import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getPatientDetail, listPatients } from "@/features/patient/patient.service";
import type { EvaluationDTO, PatientDTO } from "@/features/patient/patient.types";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { EMPTY_PROFESSIONAL } from "@/features/settings/settings.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { RelatorioClient } from "./relatorio-client";

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string }>;
}) {
  const params = await searchParams;
  const initialPatientId = params.paciente ?? null;
  let error: string | null = null;
  let patients: PatientDTO[] = [];
  let initialEvaluations: EvaluationDTO[] = [];
  let initialEvaluationId = "";
  let professional: ProfessionalProfile = EMPTY_PROFESSIONAL;
  let branding: PrintBranding = {
    clinicName: "Fichário TO",
    logoUrl: "/paris.png",
  };

  try {
    const { organizationId } = await requireOrgId();
    [patients, professional, branding] = await Promise.all([
      listPatients(organizationId),
      getProfessionalProfile(organizationId),
      getPrintBranding(organizationId),
    ]);

    if (initialPatientId) {
      const detail = await getPatientDetail(organizationId, initialPatientId);
      if (detail) {
        initialEvaluations = detail.evaluations;
        initialEvaluationId = detail.evaluations[0]?.id ?? "";
      }
    }
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os dados para relatórios.";
  }

  return (
    <AppPage title="Relatórios">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <RelatorioClient
          patients={patients}
          professional={professional}
          branding={branding}
          initialPatientId={initialPatientId}
          initialEvaluations={initialEvaluations}
          initialEvaluationId={initialEvaluationId}
        />
      )}
    </AppPage>
  );
}
