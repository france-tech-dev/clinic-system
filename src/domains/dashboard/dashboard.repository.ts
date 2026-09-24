import { db } from "@/shared/lib/prisma";
import { AppointmentStatus, PatientStatus } from "@prisma/enums";

export const dashboardRepository = {
  countPatients(organizationId: string) {
    return db.patient.count({ where: { organizationId } });
  },

  countActivePatients(organizationId: string) {
    return db.patient.count({
      where: { organizationId, status: PatientStatus.ACTIVE },
    });
  },

  countAssessments(organizationId: string) {
    return db.assessment.count({
      where: { patient: { organizationId } },
    });
  },

  countEvolutionsSince(organizationId: string, weekStart: string) {
    return db.evolution.count({
      where: {
        patient: { organizationId },
        date: { gte: weekStart },
      },
    });
  },

  findActivePatientsWithLastAssessment(organizationId: string) {
    return db.patient.findMany({
      where: { organizationId, status: PatientStatus.ACTIVE },
      include: {
        assessments: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    });
  },

  findRecentAssessments(organizationId: string, take = 8) {
    return db.assessment.findMany({
      where: { patient: { organizationId } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take,
    });
  },

  findRecentEvolutions(organizationId: string, take = 8) {
    return db.evolution.findMany({
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

  findEvolutionDatesSince(organizationId: string, startDate: string) {
    return db.evolution.findMany({
      where: {
        patient: { organizationId },
        date: { gte: startDate },
      },
      select: { date: true },
    });
  },

  findAssessmentDatesSince(organizationId: string, startDate: string) {
    return db.assessment.findMany({
      where: {
        patient: { organizationId },
        date: { gte: startDate },
      },
      select: { date: true },
    });
  },

  findActivePatientsWithBirthDate(organizationId: string) {
    return db.patient.findMany({
      where: {
        organizationId,
        status: PatientStatus.ACTIVE,
        birthDate: { not: null },
      },
      select: { id: true, name: true, birthDate: true },
    });
  },

  findAppointmentSlotsSince(organizationId: string, startDate: string) {
    return db.appointment.findMany({
      where: {
        organizationId,
        date: { gte: startDate },
        status: { not: AppointmentStatus.CANCELLED },
      },
      select: { date: true, time: true },
    });
  },
};
