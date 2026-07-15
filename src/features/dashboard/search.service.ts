import { paths } from "@/shared/constants/paths";
import { searchRepository } from "./search.repository";

export type SearchHit = {
  id: string;
  kind: "patient" | "evaluation" | "session";
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(
  organizationId: string,
  query: string,
): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [patients, evaluations, sessions] = await Promise.all([
    searchRepository.searchPatients(organizationId, q),
    searchRepository.searchEvaluations(organizationId, q),
    searchRepository.searchSessions(organizationId, q),
  ]);

  const hits: SearchHit[] = [
    ...patients.map((p) => ({
      id: p.id,
      kind: "patient" as const,
      title: p.name,
      subtitle: p.notes || "Paciente",
      href: paths.paciente(p.id),
    })),
    ...evaluations.map((e) => ({
      id: e.id,
      kind: "evaluation" as const,
      title: `${e.patient.name} — Avaliação ${e.tipo}`,
      subtitle: e.queixa || e.date,
      href: paths.paciente(e.patient.id),
    })),
    ...sessions.map((s) => ({
      id: s.id,
      kind: "session" as const,
      title: `${s.patient.name} — Evolução`,
      subtitle: s.atividades || s.date,
      href: paths.paciente(s.patient.id),
    })),
  ];

  return hits.slice(0, 20);
}
