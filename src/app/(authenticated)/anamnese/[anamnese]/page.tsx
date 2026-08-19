import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getAnamneseForm, getCatalogAnamnese } from "@/features/anamnese/forms";
import { listPatients } from "@/features/patient/patient.service";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import { getBillingAccess } from "@/server/billing/access";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { paths } from "@/shared/constants/paths";

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
  let canWrite = true;

  try {
    const { organizationId } = await requireOrgId();
    const [patients, branding, professional, access] = await Promise.all([
      listPatients(organizationId),
      getPrintBranding(organizationId),
      getProfessionalProfile(organizationId),
      getBillingAccess(organizationId),
    ]);
    canWrite = access.mode === "full" && access.features.includes("anamnese");
    content = await form.render({
      organizationId,
      patients,
      initialPatientId,
      branding,
      professional,
      canWrite,
    });
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : `Não foi possível carregar a anamnese ${catalogEntry.name}.`;
  }

  return (
    <AppPage title={catalogEntry.name} fillViewport>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button asChild size="sm" variant="outline">
              <Link href={paths.anamnese.byId(formId)}>Tentar de novo</Link>
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {canWrite ? null : (
            <Alert className="shrink-0">
              <AlertTitle>Fora do plano atual</AlertTitle>
              <AlertDescription>
                Pode consultar o histórico. Para preencher ou gravar,{" "}
                <Link href={paths.planos}>mude de plano</Link>.
              </AlertDescription>
            </Alert>
          )}
          {content}
        </div>
      )}
    </AppPage>
  );
}
