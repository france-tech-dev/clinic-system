import { db } from "@/shared/lib/prisma";

export const dashboardRepository = {
  countPatients(organizationId: string) {
    return db.patient.count({ where: { organizationId } });
  },

  countActivePatients(organizationId: string) {
    return db.patient.count({
      where: { organizationId, status: "ativo" },
    });
  },

  countEvaluations(organizationId: string) {
    return db.evaluation.count({
      where: { patient: { organizationId } },
    });
  },

  countSessionsSince(organizationId: string, weekStart: string) {
    return db.sessionNote.count({
      where: {
        patient: { organizationId },
        date: { gte: weekStart },
      },
    });
  },

  findActivePatientsWithLastEvaluation(organizationId: string) {
    return db.patient.findMany({
      where: { organizationId, status: "ativo" },
      include: {
        evaluations: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    });
  },

  findRecentEvaluations(organizationId: string, take = 8) {
    return db.evaluation.findMany({
      where: { patient: { organizationId } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take,
    });
  },

  findRecentSessions(organizationId: string, take = 8) {
    return db.sessionNote.findMany({
      where: { patient: { organizationId } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take,
    });
  },

  findTodayAppointments(organizationId: string, today: string) {
    return db.appointment.findMany({
      where: { organizationId, date: today },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ time: "asc" }],
    });
  },
};
