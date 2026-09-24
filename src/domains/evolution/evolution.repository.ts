import { db } from "@/shared/lib/prisma";
import type { EvolutionFormInput } from "./evolution.schema";

const memberAuthorInclude = {
  member: {
    select: {
      id: true,
      metadata: true,
      registration: true,
      user: { select: { name: true } },
    },
  },
} as const;

export const evolutionRepository = {
  async findByPatient(organizationId: string, patientId: string) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.evolution.findMany({
      where: { patientId },
      include: memberAuthorInclude,
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });
  },

  async findLinkableAppointments(organizationId: string, patientId: string) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.appointment.findMany({
      where: { patientId, organizationId },
      include: {
        member: {
          select: { user: { select: { name: true } } },
        },
        evolution: { select: { id: true } },
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true },
    });
  },

  async create(
    organizationId: string,
    data: EvolutionFormInput,
    memberId: string | null,
  ) {
    const appointment = await db.appointment.findFirst({
      where: {
        id: data.appointmentId,
        patientId: data.patientId,
        organizationId,
        evolution: null,
      },
    });
    if (!appointment) return null;

    return db.evolution.create({
      data: {
        patientId: data.patientId,
        appointmentId: appointment.id,
        memberId: memberId ?? appointment.memberId,
        date: appointment.date,
        time: appointment.time,
        status: data.status,
        activities: data.activities ?? "",
        observations: data.observations ?? "",
      },
      include: memberAuthorInclude,
    });
  },

  async update(organizationId: string, id: string, data: EvolutionFormInput) {
    const existing = await db.evolution.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;

    const appointment = await db.appointment.findFirst({
      where: {
        id: data.appointmentId,
        patientId: data.patientId,
        organizationId,
        OR: [{ evolution: null }, { evolution: { id } }],
      },
    });
    if (!appointment) return null;

    return db.evolution.update({
      where: { id },
      data: {
        appointmentId: appointment.id,
        date: appointment.date,
        time: appointment.time,
        status: data.status,
        activities: data.activities ?? "",
        observations: data.observations ?? "",
      },
      include: memberAuthorInclude,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.evolution.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.evolution.delete({ where: { id } });
    return existing;
  },
};
