import type { DashboardAlert } from "../dashboard.types";

const REAVALIATION_DAYS = 90;
const MAX_ALERTS = 8;

type PatientWithLastEvaluation = {
  id: string;
  name: string;
  clinicalEvaluations: { date: string }[];
};

export function buildDashboardAlerts(
  patients: PatientWithLastEvaluation[],
  now = new Date(),
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const patient of patients) {
    const last = patient.clinicalEvaluations[0]?.date;
    if (!last) {
      alerts.push({
        patientId: patient.id,
        patientName: patient.name,
        kind: "sem_avaliacao",
        detail: "Sem avaliação registrada",
      });
      continue;
    }

    const lastDate = new Date(last);
    const days = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days >= REAVALIATION_DAYS) {
      alerts.push({
        patientId: patient.id,
        patientName: patient.name,
        kind: "reavaliacao",
        detail: `Última avaliação há ${days} dias`,
      });
    }
  }

  return alerts.slice(0, MAX_ALERTS);
}
