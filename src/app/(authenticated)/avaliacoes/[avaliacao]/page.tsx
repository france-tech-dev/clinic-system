import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { resolveAssessmentUi } from "@/app/(authenticated)/avaliacoes/_lib/resolve-assessment-ui";
import { getCatalogAssessment } from "@/features/protocol/assessments";
import { listPatients } from "@/features/patient/patient.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";

export default async function AvaliacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ avaliacao: string }>;
  searchParams: Promise<{ paciente?: string }>;
}) {
  const { avaliacao: avaliacaoId } = await params;
  const assessment = getCatalogAssessment(avaliacaoId);
  const ui = resolveAssessmentUi(avaliacaoId);
  if (!assessment || !ui) notFound();

  const query = await searchParams;
  const initialPatientId = query.paciente ?? null;

  let error: string | null = null;
  let content: ReactNode = null;

  try {
    const { organizationId } = await requireOrgId();
    const patients = await listPatients(organizationId);
    content = await ui.render({
      organizationId,
      patients,
      initialPatientId,
    });
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : `Não foi possível carregar a avaliação ${assessment.name}.`;
  }

  return (
    <AppPage title={assessment.name}>
      {error ? <p className="text-sm text-destructive">{error}</p> : content}
    </AppPage>
  );
}
