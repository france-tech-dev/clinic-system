import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  getAnamneseForm,
  getCatalogAnamnese,
} from "@/features/anamnese/forms";
import { listPatients } from "@/features/patient/patient.service";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";

export default async function AnamneseWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ anamnese: string }>;
  searchParams: Promise<{ paciente?: string }>;
}) {
  const { anamnese: formId } = await params;
  const catalogEntry = getCatalogAnamnese(formId);
  const form = getAnamneseForm(formId);
  if (!catalogEntry || !form) notFound();

  const query = await searchParams;
  const initialPatientId = query.paciente ?? null;

  let error: string | null = null;
  let content: ReactNode = null;

  try {
    const { organizationId } = await requireOrgId();
    const [patients, branding, professional] = await Promise.all([
      listPatients(organizationId),
      getPrintBranding(organizationId),
      getProfessionalProfile(organizationId),
    ]);
    content = await form.render({
      organizationId,
      patients,
      initialPatientId,
      branding,
      professional,
    });
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : `Não foi possível carregar a anamnese ${catalogEntry.name}.`;
  }

  return (
    <AppPage title={catalogEntry.name}>
      {error ? <p className="text-sm text-destructive">{error}</p> : content}
    </AppPage>
  );
}
