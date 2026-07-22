import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listGuardians } from "@/features/guardian/guardian.service";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { listPatients } from "@/features/patient/patient.service";
import type { PatientDTO } from "@/features/patient/patient.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PacientesClient } from "./pacientes-client";

export default async function PacientesPage() {
  let patients: PatientDTO[] = [];
  let guardians: GuardianDTO[] = [];
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    [patients, guardians] = await Promise.all([
      listPatients(organizationId),
      listGuardians(organizationId),
    ]);
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
          <PacientesClient
            initialPatients={patients}
            initialGuardians={guardians}
          />
        </Suspense>
      )}
    </AppPage>
  );
}
