import { db } from "@/shared/lib/prisma";
import type {
  ProtocolEvaluationFormInput,
  UpdateProtocolEvaluationInput,
} from "./protocol.schema";

const assessmentInclude = {
  patient: { select: { id: true, name: true, birthDate: true } },
  member: {
    include: {
      user: { select: { name: true } },
    },
  },
} as const;

export const protocolRepository = {
  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true },
    });
  },

  async findByPatient(
    organizationId: string,
    patientId: string,
    protocolId?: string,
  ) {
    return db.protocolEvaluation.findMany({
      where: {
        organizationId,
        patientId,
        ...(protocolId ? { protocolId } : {}),
      },
      include: assessmentInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  async findById(organizationId: string, id: string) {
    return db.protocolEvaluation.findFirst({
      where: { id, organizationId },
      include: assessmentInclude,
    });
  },

  async create(
    organizationId: string,
    data: ProtocolEvaluationFormInput,
    memberId: string | null,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.protocolEvaluation.create({
      data: {
        organizationId,
        patientId: data.patientId,
        memberId,
        protocolId: data.protocolId,
        label: data.label,
        date: data.date,
        scores: JSON.stringify(data.scores),
        notes: data.notes ?? "",
      },
      include: assessmentInclude,
    });
  },

  async update(organizationId: string, data: UpdateProtocolEvaluationInput) {
    const existing = await db.protocolEvaluation.findFirst({
      where: { id: data.id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    return db.protocolEvaluation.update({
      where: { id: data.id },
      data: {
        label: data.label,
        date: data.date,
        scores: JSON.stringify(data.scores),
        notes: data.notes ?? "",
      },
      include: assessmentInclude,
    });
  },

  async updateInterpretationAI(
    organizationId: string,
    id: string,
    interpretationAI: string | null,
  ) {
    const existing = await db.protocolEvaluation.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    return db.protocolEvaluation.update({
      where: { id },
      data: {
        interpretationAI,
        interpretationAIUpdatedAt: interpretationAI ? new Date() : null,
      },
      include: assessmentInclude,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.protocolEvaluation.findFirst({
      where: { id, organizationId },
      include: assessmentInclude,
    });
    if (!existing) return null;

    await db.protocolEvaluation.delete({ where: { id } });
    return existing;
  },
};
