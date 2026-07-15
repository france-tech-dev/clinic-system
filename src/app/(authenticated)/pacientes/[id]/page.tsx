import { notFound } from "next/navigation";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getPatientDetail } from "@/features/patient/patient.service";
import type { PatientDetailDTO } from "@/features/patient/patient.types";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PacienteDetailClient } from "./paciente-detail-client";

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let error: string | null = null;
  let detail: PatientDetailDTO | null = null;
  let professional: ProfessionalProfile = {
    nome: "",
    registro: "",
    clinica: "",
  };

  let branding: PrintBranding = {
    clinicName: "Fichário TO",
    logoUrl: "/paris.png",
  };

  try {
    const { organizationId } = await requireOrgId();
    const [d, prof, printBranding] = await Promise.all([
      getPatientDetail(organizationId, id),
      getProfessionalProfile(organizationId),
      getPrintBranding(organizationId),
    ]);
    detail = d;
    professional = prof;
    branding = printBranding;
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o paciente.";
  }

  if (error) {
    return (
      <AppPage title="Paciente">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  if (!detail) notFound();

  return (
    <AppPage title={detail.patient.name}>
      <PacienteDetailClient
        initial={detail}
        professional={professional}
        branding={branding}
      />
    </AppPage>
  );
}
