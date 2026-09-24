import { db } from "../src/shared/lib/prisma";
import {
  buildDemoAnamneseData,
  buildDemoAppointments,
  buildDemoAssessment,
  buildDemoCashTransaction,
  buildDemoEvolutions,
  DEMO_PATIENT_NAME,
  DEMO_PATIENT_NOTES,
  DEMO_PATIENT_SEED_MARKER,
} from "./demo-patient";

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
  const assessment = buildDemoAssessment(baseDate);
  const evolutions = buildDemoEvolutions();
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

    const guardian = await tx.guardian.create({
      data: {
        organizationId,
        name: "Responsável Demonstração",
        phone: "(11) 98888-0000",
        email: "responsavel.demo@example.com",
        insurance: "particular",
        address: "Rua Exemplo, 100",
        zipCode: "01000-000",
      },
    });

    const createdPatient = await tx.patient.create({
      data: {
        organizationId,
        guardianId: guardian.id,
        name: DEMO_PATIENT_NAME,
        birthDate: new Date(Date.UTC(2018, 2, 15)),
        sex: "MALE",
        notes: `${DEMO_PATIENT_NOTES}\n${DEMO_PATIENT_SEED_MARKER}`,
        status: "ACTIVE",
        pricingType: "SESSION",
        price: 150,
      },
    });

    await tx.assessment.create({
      data: {
        patientId: createdPatient.id,
        memberId: member.id,
        type: assessment.type,
        date: assessment.date,
        complaint: assessment.complaint,
        history: assessment.history,
        domains: JSON.stringify(assessment.domains),
        goals: assessment.goals,
        interventions: assessment.interventions,
        diagnosis: assessment.diagnosis,
        referredBy: assessment.referredBy,
        familyContext: assessment.familyContext,
        previousLevel: assessment.previousLevel,
        medications: assessment.medications,
        precautions: assessment.precautions,
        equipment: assessment.equipment,
        frequency: assessment.frequency,
        dischargeCriteria: assessment.dischargeCriteria,
      },
    });

    await tx.anamnese.create({
      data: {
        organizationId,
        patientId: createdPatient.id,
        formId: "anamnese-to",
        data: JSON.stringify(anamneseData),
      },
    });

    const createdAppointments = [];
    for (const appointment of appointments) {
      const row = await tx.appointment.create({
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
      createdAppointments.push({
        ...row,
        withEvolution: appointment.withEvolution,
      });
    }

    const evolutionAppointments = createdAppointments.filter(
      (appointment) => appointment.withEvolution,
    );
    for (let index = 0; index < evolutions.length; index++) {
      const note = evolutions[index];
      const appointment = evolutionAppointments[index];
      if (!note || !appointment) continue;
      await tx.evolution.create({
        data: {
          patientId: createdPatient.id,
          memberId: member.id,
          appointmentId: appointment.id,
          date: appointment.date,
          time: appointment.time,
          status: note.status,
          activities: note.activities,
          observations: note.observations,
        },
      });
    }

    await tx.cashTransaction.create({
      data: {
        organizationId,
        patientId: createdPatient.id,
        memberId: member.id,
        type: cashTransaction.type,
        amount: cashTransaction.amount,
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
