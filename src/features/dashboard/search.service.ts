import { db } from "@/shared/lib/prisma";
import { paths } from "@/shared/constants/paths";
import { studyCategoryOf } from "@/shared/constants/study-categories";

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
      db.patient.findMany({
        where: {
          organizationId,
          OR: [{ name: { contains: q } }, { notes: { contains: q } }],
        },
        take: 8,
        orderBy: { name: "asc" },
      }),
      db.exercise.findMany({
        where: {
          organizationId,
          OR: [{ title: { contains: q } }, { objective: { contains: q } }],
        },
        take: 8,
        orderBy: { title: "asc" },
      }),
      db.evaluation.findMany({
        where: {
          patient: { organizationId },
          OR: [
            { queixa: { contains: q } },
            { historia: { contains: q } },
            { objetivos: { contains: q } },
            { diagnostico: { contains: q } },
          ],
        },
        include: { patient: { select: { id: true, name: true } } },
        take: 8,
        orderBy: { date: "desc" },
      }),
      db.sessionNote.findMany({
        where: {
          patient: { organizationId },
          OR: [
            { atividades: { contains: q } },
            { observacoes: { contains: q } },
          ],
        },
        include: { patient: { select: { id: true, name: true } } },
        take: 8,
        orderBy: { date: "desc" },
      }),
      db.studyCard.findMany({
        where: {
          organizationId,
          OR: [{ title: { contains: q } }, { content: { contains: q } }],
        },
        take: 8,
        orderBy: { title: "asc" },
      }),
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
