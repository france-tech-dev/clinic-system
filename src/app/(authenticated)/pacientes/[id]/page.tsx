import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { listExercises } from "@/features/exercise/exercise.service";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { getPatientDetail } from "@/features/patient/patient.service";
import type { PatientDetailDTO } from "@/features/patient/patient.types";
import { getProfessionalProfile } from "@/features/settings/settings.service";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
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
  let exercises: ExerciseDTO[] = [];
  let professional: ProfessionalProfile = {
    nome: "",
    registro: "",
    clinica: "",
  };

  try {
    const { organizationId } = await requireOrgId();
    const [d, ex, prof] = await Promise.all([
      getPatientDetail(organizationId, id),
      listExercises(organizationId),
      getProfessionalProfile(organizationId),
    ]);
    detail = d;
    exercises = ex;
    professional = prof;
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o paciente.";
  }

  if (error) {
    return (
      <>
        <SiteHeader title="Paciente" />
        <div className="p-6 text-sm text-destructive">{error}</div>
      </>
    );
  }

  if (!detail) notFound();

  return (
    <>
      <SiteHeader title={detail.patient.name} />
      <PacienteDetailClient
        initial={detail}
        exercises={exercises}
        professional={professional}
      />
    </>
  );
}
