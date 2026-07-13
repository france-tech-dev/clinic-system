import { db } from "@/shared/lib/prisma";

export const searchRepository = {
  searchPatients(organizationId: string, q: string, take = 8) {
    return db.patient.findMany({
      where: {
        organizationId,
        OR: [{ name: { contains: q } }, { notes: { contains: q } }],
      },
      take,
      orderBy: { name: "asc" },
    });
  },

  searchExercises(organizationId: string, q: string, take = 8) {
    return db.exercise.findMany({
      where: {
        organizationId,
        OR: [{ title: { contains: q } }, { objective: { contains: q } }],
      },
      take,
      orderBy: { title: "asc" },
    });
  },

  searchEvaluations(organizationId: string, q: string, take = 8) {
    return db.evaluation.findMany({
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
      take,
      orderBy: { date: "desc" },
    });
  },

  searchSessions(organizationId: string, q: string, take = 8) {
    return db.sessionNote.findMany({
      where: {
        patient: { organizationId },
        OR: [
          { atividades: { contains: q } },
          { observacoes: { contains: q } },
        ],
      },
      include: { patient: { select: { id: true, name: true } } },
      take,
      orderBy: { date: "desc" },
    });
  },

  searchStudyCards(organizationId: string, q: string, take = 8) {
    return db.studyCard.findMany({
      where: {
        organizationId,
        OR: [{ title: { contains: q } }, { content: { contains: q } }],
      },
      take,
      orderBy: { title: "asc" },
    });
  },
};
