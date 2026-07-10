import { Suspense } from "react";
import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { listPatients } from "@/features/patient/patient.service";
import type { PatientDTO } from "@/features/patient/patient.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PacientesClient } from "./pacientes-client";

export default async function PacientesPage() {
  let patients: PatientDTO[] = [];
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    patients = await listPatients(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os pacientes.";
  }

  return (
    <>
      <SiteHeader title="Pacientes" />
      {error ? (
        <div className="p-6 text-sm text-destructive">{error}</div>
      ) : (
        <Suspense fallback={<div className="p-6 text-sm">A carregar…</div>}>
          <PacientesClient initialPatients={patients} />
        </Suspense>
      )}
    </>
  );
}
