import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
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
    <AppPage title="Pacientes">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <Suspense fallback={<p className="text-sm">A carregar…</p>}>
          <PacientesClient initialPatients={patients} />
        </Suspense>
      )}
    </AppPage>
  );
}
