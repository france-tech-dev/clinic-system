import { db } from "@/shared/lib/prisma";
import { addDaysIso } from "@/shared/constants/appointment";
import type {
  AppointmentFormInput,
  UpdateAppointmentInput,
} from "./schedule.schema";
import type { AppointmentStatusId } from "@/shared/constants/appointment";

export const scheduleRepository = {
  async findByDate(organizationId: string, date: string) {
    return db.appointment.findMany({
      where: { organizationId, date },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ time: "asc" }, { createdAt: "asc" }],
    });
  },

  async findUpcoming(organizationId: string, fromDate: string, take = 20) {
    return db.appointment.findMany({
      where: { organizationId, date: { gte: fromDate } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take,
    });
  },

  async findById(organizationId: string, id: string) {
    return db.appointment.findFirst({
      where: { id, organizationId },
      include: { patient: { select: { id: true, name: true } } },
    });
  },

  async createMany(organizationId: string, data: AppointmentFormInput) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;

    const weeks = data.repeatWeeks ?? 1;
    const created = [];
    for (let i = 0; i < weeks; i++) {
      const row = await db.appointment.create({
        data: {
          organizationId,
          patientId: data.patientId,
          date: addDaysIso(data.date, i * 7),
          time: data.time ?? "",
          duration: data.duration ?? 50,
          notes: data.notes ?? "",
          status: "agendado",
        },
        include: { patient: { select: { id: true, name: true } } },
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

    return db.appointment.update({
      where: { id: data.id },
      data: {
        patientId: data.patientId,
        date: data.date,
        time: data.time ?? "",
        duration: data.duration ?? 50,
        notes: data.notes ?? "",
        status: data.status as AppointmentStatusId,
      },
      include: { patient: { select: { id: true, name: true } } },
    });
  },

  async setStatus(
    organizationId: string,
    id: string,
    status: AppointmentStatusId,
  ) {
    const existing = await db.appointment.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.appointment.update({
      where: { id },
      data: { status },
      include: { patient: { select: { id: true, name: true } } },
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
