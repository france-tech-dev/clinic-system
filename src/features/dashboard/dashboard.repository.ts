import { db } from "@/shared/lib/prisma";

export const dashboardRepository = {
  countPatients(organizationId: string) {
    return db.patient.count({ where: { organizationId } });
  },

  countActivePatients(organizationId: string) {
    return db.patient.count({
      where: { organizationId, status: "active" },
    });
  },

  countClinicalEvaluations(organizationId: string) {
    return db.clinicalEvaluation.count({
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

  findActivePatientsWithLastClinicalEvaluation(organizationId: string) {
    return db.patient.findMany({
      where: { organizationId, status: "active" },
      include: {
        clinicalEvaluations: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    });
  },

  findRecentClinicalEvaluations(organizationId: string, take = 8) {
    return db.clinicalEvaluation.findMany({
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

  findPatientCreatedAtsSince(organizationId: string, since: Date) {
    return db.patient.findMany({
      where: { organizationId, createdAt: { gte: since } },
      select: { createdAt: true },
    });
  },

  findSessionDatesSince(organizationId: string, startDate: string) {
    return db.sessionNote.findMany({
      where: {
        patient: { organizationId },
        date: { gte: startDate },
      },
      select: { date: true },
    });
  },

  findEvaluationDatesSince(organizationId: string, startDate: string) {
    return db.clinicalEvaluation.findMany({
      where: {
        patient: { organizationId },
        date: { gte: startDate },
      },
      select: { date: true },
    });
  },
};
