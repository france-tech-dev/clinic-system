import { db } from "@/shared/lib/prisma";
import type {
  ProtocolAssessmentFormInput,
  UpdateProtocolAssessmentInput,
} from "./protocol.schema";

export const protocolRepository = {
  async findByPatient(
    organizationId: string,
    patientId: string,
    protocolId?: string,
  ) {
    return db.protocolAssessment.findMany({
      where: {
        organizationId,
        patientId,
        ...(protocolId ? { protocolId } : {}),
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  async findById(organizationId: string, id: string) {
    return db.protocolAssessment.findFirst({
      where: { id, organizationId },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });
  },

  async create(organizationId: string, data: ProtocolAssessmentFormInput) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.protocolAssessment.create({
      data: {
        organizationId,
        patientId: data.patientId,
        protocolId: data.protocolId,
        label: data.label,
        date: data.date,
        scores: JSON.stringify(data.scores),
        notes: data.notes ?? "",
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });
  },

  async update(organizationId: string, data: UpdateProtocolAssessmentInput) {
    const existing = await db.protocolAssessment.findFirst({
      where: { id: data.id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    return db.protocolAssessment.update({
      where: { id: data.id },
      data: {
        label: data.label,
        date: data.date,
        scores: JSON.stringify(data.scores),
        notes: data.notes ?? "",
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.protocolAssessment.findFirst({
      where: { id, organizationId },
      include: {
        patient: { select: { id: true, name: true } },
      },
    });
    if (!existing) return null;

    await db.protocolAssessment.delete({ where: { id } });
    return existing;
  },
};
