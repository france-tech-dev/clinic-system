import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listPatients } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { RelatorioClient } from "./relatorio-client";

export default async function RelatorioPage() {
  let patients: PatientDTO[] = [];
  let error: string | null = null;

  try {
    await requirePermission({ reports: ["read"] });
    const { organizationId } = await requireOrgId();
    patients = await listPatients(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os relatórios.";
  }

  if (error) {
    return (
      <AppPage title="Relatórios">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  return (
    <Suspense fallback={<p className="text-sm">A carregar…</p>}>
      <RelatorioClient patients={patients} />
    </Suspense>
  );
}
