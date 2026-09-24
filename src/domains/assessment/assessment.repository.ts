import { db } from "@/shared/lib/prisma";
import type { AssessmentFormInput } from "./assessment.schema";

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

export const assessmentRepository = {
  async findByPatient(organizationId: string, patientId: string) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.assessment.findMany({
      where: { patientId },
      include: memberAuthorInclude,
      orderBy: { date: "desc" },
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
    data: AssessmentFormInput,
    memberId: string | null,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    const { patientId, domains, ...rest } = data;
    return db.assessment.create({
      data: {
        patientId,
        memberId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async update(organizationId: string, id: string, data: AssessmentFormInput) {
    const existing = await db.assessment.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    const { patientId, domains, ...rest } = data;
    return db.assessment.update({
      where: { id },
      data: {
        patientId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.assessment.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.assessment.delete({ where: { id } });
    return existing;
  },
};
