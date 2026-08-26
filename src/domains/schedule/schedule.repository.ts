import { db } from "@/shared/lib/prisma";
import { addDaysIso } from "@/shared/constants/appointment";
import {
  AppointmentStatus,
  MemberStatus,
  Role,
  SessionNoteStatus,
} from "@prisma/enums";
import type {
  AppointmentFormInput,
  UpdateAppointmentInput,
} from "./schedule.schema";

const patientSelect = {
  id: true,
  name: true,
  pricingType: true,
  price: true,
} as const;

const appointmentInclude = {
  patient: { select: patientSelect },
  member: {
    include: {
      user: { select: { name: true } },
    },
  },
} as const;

export const scheduleRepository = {
  async findSessionNoteAppointmentIdsInRange(
    organizationId: string,
    startDate: string,
    endDate: string,
  ) {
    const notes = await db.sessionNote.findMany({
      where: {
        patient: { organizationId },
        date: { gte: startDate, lte: endDate },
        status: SessionNoteStatus.ATTENDED,
        appointmentId: { not: null },
      },
      select: { appointmentId: true },
    });
    return new Set(
      notes.map((n) => n.appointmentId).filter((id): id is string => !!id),
    );
  },

  async findOrgMembers(organizationId: string) {
    return db.member.findMany({
      where: {
        organizationId,
        status: MemberStatus.ACTIVE,
        role: { not: Role.CLIENT },
      },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      include: { user: { select: { id: true, name: true } } },
    });
  },

  async findMemberInOrg(organizationId: string, memberId: string) {
    return db.member.findFirst({
      where: { id: memberId, organizationId },
      select: { id: true },
    });
  },

  async findByDate(organizationId: string, date: string) {
    return db.appointment.findMany({
      where: { organizationId, date },
      include: appointmentInclude,
      orderBy: [{ time: "asc" }, { createdAt: "asc" }],
    });
  },

  async findUpcoming(organizationId: string, fromDate: string, take = 20) {
    return db.appointment.findMany({
      where: { organizationId, date: { gte: fromDate } },
      include: appointmentInclude,
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take,
    });
  },

  async findByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string,
  ) {
    return db.appointment.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      include: appointmentInclude,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
  },

  async findById(organizationId: string, id: string) {
    return db.appointment.findFirst({
      where: { id, organizationId },
      include: appointmentInclude,
    });
  },

  async createMany(organizationId: string, data: AppointmentFormInput) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;

    const member = await this.findMemberInOrg(organizationId, data.memberId);
    if (!member) return null;

    const weeks = data.repeatWeeks ?? 1;
    const created = [];
    for (let i = 0; i < weeks; i++) {
      const row = await db.appointment.create({
        data: {
          organizationId,
          patientId: data.patientId,
          memberId: data.memberId,
          date: addDaysIso(data.date, i * 7),
          time: data.time ?? "",
          duration: data.duration ?? 50,
          notes: data.notes ?? "",
          status: AppointmentStatus.SCHEDULED,
        },
        include: appointmentInclude,
      });
      created.push(row);
    }
    return created;
  },

  async update(organizationId: string, data: UpdateAppointmentInput) {
    const existing = await db.appointment.findFirst({
      where: { id: data.id, organizationId },
    });
    if (!existing) return null;

    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;

    const member = await this.findMemberInOrg(organizationId, data.memberId);
    if (!member) return null;

    return db.$transaction(async (tx) => {
      const row = await tx.appointment.update({
        where: { id: data.id },
        data: {
          patientId: data.patientId,
          memberId: data.memberId,
          date: data.date,
          time: data.time ?? "",
          duration: data.duration ?? 50,
          notes: data.notes ?? "",
          status: data.status as AppointmentStatus,
        },
        include: appointmentInclude,
      });
      await tx.sessionNote.updateMany({
        where: { appointmentId: data.id },
        data: { date: data.date, time: data.time ?? "" },
      });
      return row;
    });
  },

  async reschedule(
    organizationId: string,
    id: string,
    date: string,
    time: string,
  ) {
    const existing = await db.appointment.findFirst({
      where: { id, organizationId },
    });
    if (!existing || existing.status !== AppointmentStatus.SCHEDULED) return null;

    return db.$transaction(async (tx) => {
      const row = await tx.appointment.update({
        where: { id },
        data: { date, time: time ?? "" },
        include: appointmentInclude,
      });
      await tx.sessionNote.updateMany({
        where: { appointmentId: id },
        data: { date, time: time ?? "" },
      });
      return row;
    });
  },

  async setStatus(
    organizationId: string,
    id: string,
    status: AppointmentStatus,
  ) {
    const existing = await db.appointment.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.appointment.update({
      where: { id },
      data: { status },
      include: appointmentInclude,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.appointment.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    await db.appointment.delete({ where: { id } });
    return existing;
  },
};
