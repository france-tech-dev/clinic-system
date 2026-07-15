import {
  buildDemoAnamneseData,
  buildDemoAppointments,
  buildDemoCashTransaction,
  buildDemoEvaluation,
  buildDemoSessionNotes,
  DEMO_PATIENT_NAME,
  DEMO_PATIENT_NOTES,
  DEMO_PATIENT_SEED_MARKER,
} from "@/shared/constants/demo-patient";
import { db } from "@/shared/lib/prisma";

export type DemoPatientSeedResult = {
  created: boolean;
  patientId: string;
  patientName: string;
};

/** Paciente fictício completo para apresentações — idempotente por marcador em `notes`. */
export async function ensureDemoPatient(
  organizationId: string,
): Promise<DemoPatientSeedResult> {
  const existing = await db.patient.findFirst({
    where: {
      organizationId,
      notes: { contains: DEMO_PATIENT_SEED_MARKER },
    },
    select: { id: true, name: true },
  });

  if (existing) {
    return {
      created: false,
      patientId: existing.id,
      patientName: existing.name,
    };
  }

  const baseDate = new Date();
  const evaluation = buildDemoEvaluation(baseDate);
  const sessionNotes = buildDemoSessionNotes(baseDate);
  const appointments = buildDemoAppointments(baseDate);
  const cashTransaction = buildDemoCashTransaction(baseDate);
  const anamneseData = buildDemoAnamneseData();

  const patient = await db.$transaction(async (tx) => {
    const member = await tx.member.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });
    if (!member) {
      throw new Error(
        "Organização sem membros. Não é possível criar agendamentos de demonstração.",
      );
    }

    const createdPatient = await tx.patient.create({
      data: {
        organizationId,
        name: DEMO_PATIENT_NAME,
        notes: `${DEMO_PATIENT_NOTES}\n${DEMO_PATIENT_SEED_MARKER}`,
        status: "ativo",
        pricingType: "sessao",
        priceCents: 15000,
      },
    });

    await tx.evaluation.create({
      data: {
        patientId: createdPatient.id,
        memberId: member.id,
        tipo: evaluation.tipo,
        date: evaluation.date,
        queixa: evaluation.queixa,
        historia: evaluation.historia,
        domains: JSON.stringify(evaluation.domains),
        objetivos: evaluation.objetivos,
        condutas: evaluation.condutas,
        diagnostico: evaluation.diagnostico,
        encaminhadoPor: evaluation.encaminhadoPor,
        contextoFamiliar: evaluation.contextoFamiliar,
        nivelPrevio: evaluation.nivelPrevio,
        medicacoes: evaluation.medicacoes,
        precaucoes: evaluation.precaucoes,
        equipamentos: evaluation.equipamentos,
        frequencia: evaluation.frequencia,
        criteriosAlta: evaluation.criteriosAlta,
      },
    });

    await tx.anamnese.create({
      data: {
        patientId: createdPatient.id,
        data: JSON.stringify(anamneseData),
      },
    });

    for (const note of sessionNotes) {
      await tx.sessionNote.create({
        data: {
          patientId: createdPatient.id,
          memberId: member.id,
          date: note.date,
          status: note.status,
          atividades: note.atividades,
          observacoes: note.observacoes,
        },
      });
    }

    for (const appointment of appointments) {
      await tx.appointment.create({
        data: {
          organizationId,
          patientId: createdPatient.id,
          memberId: member.id,
          date: appointment.date,
          time: appointment.time,
          duration: appointment.duration,
          status: appointment.status,
          notes: appointment.notes,
        },
      });
    }

    await tx.cashTransaction.create({
      data: {
        organizationId,
        patientId: createdPatient.id,
        memberId: member.id,
        type: cashTransaction.type,
        amountCents: cashTransaction.amountCents,
        date: cashTransaction.date,
        description: cashTransaction.description,
        paymentMethod: cashTransaction.paymentMethod,
      },
    });

    return createdPatient;
  });

  return {
    created: true,
    patientId: patient.id,
    patientName: patient.name,
  };
}
