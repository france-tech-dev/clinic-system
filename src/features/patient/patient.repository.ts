import { db } from "@/shared/lib/prisma";
import type {
  EvaluationFormInput,
  PatientFormInput,
  SessionFormInput,
} from "./patient.schema";
import type { PatientStatus } from "./patient.types";

export const patientRepository = {
  async findMany(
    organizationId: string,
    opts?: { status?: PatientStatus | null; search?: string },
  ) {
    return db.patient.findMany({
      where: {
        organizationId,
        ...(opts?.status ? { status: opts.status } : {}),
        ...(opts?.search
          ? { name: { contains: opts.search } }
          : {}),
      },
      include: {
        _count: {
          select: { evaluations: true, sessionNotes: true },
        },
        evaluations: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.patient.findFirst({
      where: { id, organizationId },
      include: {
        planItems: {
          include: { exercise: true },
          orderBy: { createdAt: "desc" },
        },
        evaluations: { orderBy: { date: "desc" } },
        anamnese: true,
        sessionNotes: { orderBy: { date: "desc" } },
        roteiroNotes: true,
      },
    });
  },

  async create(organizationId: string, data: PatientFormInput) {
    return db.patient.create({
      data: {
        organizationId,
        name: data.name,
        notes: data.notes ?? "",
      },
    });
  },

  async update(
    organizationId: string,
    id: string,
    data: PatientFormInput,
  ) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.patient.update({
      where: { id },
      data: { name: data.name, notes: data.notes ?? "" },
    });
  },

  async updateStatus(
    organizationId: string,
    id: string,
    status: PatientStatus,
  ) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.patient.update({ where: { id }, data: { status } });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    await db.patient.delete({ where: { id } });
    return existing;
  },

  async assignExercise(
    organizationId: string,
    patientId: string,
    exerciseId: string,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
    });
    if (!patient) return null;
    const exercise = await db.exercise.findFirst({
      where: { id: exerciseId, organizationId },
    });
    if (!exercise) return null;
    return db.patientPlanItem.upsert({
      where: {
        patientId_exerciseId: { patientId, exerciseId },
      },
      create: { patientId, exerciseId },
      update: {},
      include: { exercise: true },
    });
  },

  async removePlanItem(organizationId: string, planItemId: string) {
    const item = await db.patientPlanItem.findFirst({
      where: { id: planItemId, patient: { organizationId } },
    });
    if (!item) return null;
    await db.patientPlanItem.delete({ where: { id: planItemId } });
    return item;
  },

  async createEvaluation(
    organizationId: string,
    data: EvaluationFormInput,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    const { patientId, domains, ...rest } = data;
    return db.evaluation.create({
      data: {
        patientId,
        ...rest,
        domains: JSON.stringify(domains),
      },
    });
  },

  async updateEvaluation(
    organizationId: string,
    id: string,
    data: EvaluationFormInput,
  ) {
    const existing = await db.evaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    const { patientId, domains, ...rest } = data;
    return db.evaluation.update({
      where: { id },
      data: {
        patientId,
        ...rest,
        domains: JSON.stringify(domains),
      },
    });
  },

  async deleteEvaluation(organizationId: string, id: string) {
    const existing = await db.evaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.evaluation.delete({ where: { id } });
    return existing;
  },

  async upsertAnamnese(
    organizationId: string,
    patientId: string,
    data: Record<string, unknown>,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
    });
    if (!patient) return null;
    return db.anamnese.upsert({
      where: { patientId },
      create: { patientId, data: JSON.stringify(data) },
      update: { data: JSON.stringify(data) },
    });
  },

  async createSession(organizationId: string, data: SessionFormInput) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    return db.sessionNote.create({
      data: {
        patientId: data.patientId,
        date: data.date,
        status: data.status,
        atividades: data.atividades ?? "",
        observacoes: data.observacoes ?? "",
      },
    });
  },

  async updateSession(
    organizationId: string,
    id: string,
    data: SessionFormInput,
  ) {
    const existing = await db.sessionNote.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    return db.sessionNote.update({
      where: { id },
      data: {
        date: data.date,
        status: data.status,
        atividades: data.atividades ?? "",
        observacoes: data.observacoes ?? "",
      },
    });
  },

  async deleteSession(organizationId: string, id: string) {
    const existing = await db.sessionNote.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.sessionNote.delete({ where: { id } });
    return existing;
  },

  async upsertRoteiroNote(
    organizationId: string,
    data: {
      patientId: string;
      roteiroId: string;
      categoryTick: string;
      notes: string;
    },
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    return db.roteiroNote.upsert({
      where: {
        patientId_roteiroId_categoryTick: {
          patientId: data.patientId,
          roteiroId: data.roteiroId,
          categoryTick: data.categoryTick,
        },
      },
      create: {
        patientId: data.patientId,
        roteiroId: data.roteiroId,
        categoryTick: data.categoryTick,
        notes: data.notes,
      },
      update: { notes: data.notes },
    });
  },
};
