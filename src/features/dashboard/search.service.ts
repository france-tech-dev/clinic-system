import { paths } from "@/shared/constants/paths";
import { studyCategoryOf } from "@/shared/constants/study-categories";
import { searchRepository } from "./search.repository";

export type SearchHit = {
  id: string;
  kind: "patient" | "exercise" | "evaluation" | "session" | "study";
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

  const [patients, exercises, evaluations, sessions, studyCards] =
    await Promise.all([
      searchRepository.searchPatients(organizationId, q),
      searchRepository.searchExercises(organizationId, q),
      searchRepository.searchEvaluations(organizationId, q),
      searchRepository.searchSessions(organizationId, q),
      searchRepository.searchStudyCards(organizationId, q),
    ]);

  const hits: SearchHit[] = [
    ...patients.map((p) => ({
      id: p.id,
      kind: "patient" as const,
      title: p.name,
      subtitle: p.notes || "Paciente",
      href: paths.paciente(p.id),
    })),
    ...exercises.map((e) => ({
      id: e.id,
      kind: "exercise" as const,
      title: e.title,
      subtitle: e.objective,
      href: paths.biblioteca,
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
    ...studyCards.map((c) => ({
      id: c.id,
      kind: "study" as const,
      title: c.title,
      subtitle: studyCategoryOf(c.categoryId).label,
      href: paths.estudo,
    })),
  ];

  return hits.slice(0, 20);
}
