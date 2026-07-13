import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listPatients } from "@/features/patient/patient.service";
import { GMFM88_PROTOCOL_ID } from "@/features/protocol/_lib/gmfm-88-template";
import { listProtocolAssessments } from "@/features/protocol/protocol.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { GmfmProtocolClient } from "./gmfm-client";

export default async function GmfmProtocolPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string }>;
}) {
  const params = await searchParams;
  const initialPatientId = params.paciente ?? null;
  let error: string | null = null;
  let patients: Awaited<ReturnType<typeof listPatients>> = [];
  let initialAssessments: Awaited<ReturnType<typeof listProtocolAssessments>> =
    [];

  try {
    const { organizationId } = await requireOrgId();
    patients = await listPatients(organizationId);

    if (initialPatientId) {
      initialAssessments = await listProtocolAssessments(
        organizationId,
        initialPatientId,
        GMFM88_PROTOCOL_ID,
      );
    }
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o protocolo GMFM-88.";
  }

  return (
    <AppPage title="GMFM-88">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <GmfmProtocolClient
          patients={patients}
          initialPatientId={initialPatientId}
          initialAssessments={initialAssessments}
        />
      )}
    </AppPage>
  );
}
