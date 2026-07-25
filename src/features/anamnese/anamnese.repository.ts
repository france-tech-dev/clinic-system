import { db } from "@/shared/lib/prisma";

export const anamneseRepository = {
  async findByPatient(organizationId: string, patientId: string) {
    return db.anamnese.findMany({
      where: { organizationId, patientId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async findByPatientAndForm(
    organizationId: string,
    patientId: string,
    formId: string,
  ) {
    return db.anamnese.findFirst({
      where: { organizationId, patientId, formId },
    });
  },

  async upsert(
    organizationId: string,
    patientId: string,
    formId: string,
    data: Record<string, unknown>,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    return db.anamnese.upsert({
      where: {
        patientId_formId: { patientId, formId },
      },
      create: {
        organizationId,
        patientId,
        formId,
        data: JSON.stringify(data),
      },
      update: {
        data: JSON.stringify(data),
      },
    });
  },
};
