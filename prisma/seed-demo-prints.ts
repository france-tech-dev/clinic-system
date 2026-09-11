import { createCredentialUser } from "../src/shared/lib/create-credential-user";
import { db } from "../src/shared/lib/prisma";
import { serializeMemberProfessionalMetadata } from "../src/shared/types/professional";
import {
  birthDateForSeed,
  buildPrintsAnamnese,
  buildPrintsClinicalEvaluation,
  DEMO_PRINTS_PASSWORD,
  DEMO_PRINTS_PATIENTS,
  DEMO_PRINTS_PROFESSIONALS,
  DEMO_PRINTS_SESSION_ACTIVITIES,
  demoPrintsMarker,
  offsetIsoDate,
  type DemoPrintsPatientDef,
} from "./demo-prints";

type MemberRef = {
  id: string;
  profession: string | null;
};

export type DemoPrintsSeedResult = {
  professionalsCreated: number;
  patientsCreated: number;
  appointmentsCreated: number;
};

function pickMember(
  def: DemoPrintsPatientDef,
  owner: MemberRef,
  byProfession: Map<string, MemberRef>,
): MemberRef {
  if (def.profession === "owner") return owner;
  return byProfession.get(def.profession) ?? owner;
}

async function ensureDemoProfessional(
  organizationId: string,
  spec: (typeof DEMO_PRINTS_PROFESSIONALS)[number],
): Promise<{ created: boolean; memberId: string }> {
  const existingUser = await db.user.findUnique({
    where: { email: spec.email },
    select: { id: true },
  });

  let userId = existingUser?.id ?? null;
  let created = false;

  if (!userId) {
    const user = await createCredentialUser({
      name: spec.name,
      email: spec.email,
      password: DEMO_PRINTS_PASSWORD,
      phone: spec.phone,
    });
    userId = user.id;
    created = true;
  }

  const existingMember = await db.member.findFirst({
    where: { organizationId, userId },
    select: { id: true },
  });
  if (existingMember) {
    return { created: false, memberId: existingMember.id };
  }

  const member = await db.member.create({
    data: {
      id: `demo-prints-${spec.profession}`,
      organizationId,
      userId,
      role: "MEMBER",
      status: "ACTIVE",
      profession: spec.profession,
      registration: spec.registration,
      metadata: serializeMemberProfessionalMetadata({
        name: spec.name,
        registration: spec.registration,
      }),
      createdAt: new Date(),
    },
    select: { id: true },
  });

  return { created, memberId: member.id };
}

function weekdayOffsets(from: number, to: number, base: Date): number[] {
  const offsets: number[] = [];
  for (let days = from; days <= to; days++) {
    const date = new Date(base);
    date.setDate(date.getDate() + days);
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) continue;
    offsets.push(days);
  }
  return offsets;
}

export async function ensureDemoPrints(
  organizationId: string,
): Promise<DemoPrintsSeedResult> {
  const owner = await db.member.findFirst({
    where: { organizationId, role: { not: "CLIENT" } },
    orderBy: { createdAt: "asc" },
    select: { id: true, profession: true },
  });
  if (!owner) {
    throw new Error(
      "Organização sem membros. Não é possível criar o roster de demonstração.",
    );
  }

  let professionalsCreated = 0;
  const byProfession = new Map<string, MemberRef>();

  for (const spec of DEMO_PRINTS_PROFESSIONALS) {
    const result = await ensureDemoProfessional(organizationId, spec);
    if (result.created) professionalsCreated += 1;
    byProfession.set(spec.profession, {
      id: result.memberId,
      profession: spec.profession,
    });
  }

  const existing = await db.patient.findMany({
    where: {
      organizationId,
      notes: { contains: "seed:demo-prints:" },
    },
    select: { notes: true },
  });
  const existingIds = new Set(
    existing.flatMap((row) => {
      const match = /seed:demo-prints:([a-z]+)/.exec(row.notes);
      return match?.[1] ? [match[1]] : [];
    }),
  );

  const pending = DEMO_PRINTS_PATIENTS.filter((p) => !existingIds.has(p.id));
  if (pending.length === 0) {
    return {
      professionalsCreated,
      patientsCreated: 0,
      appointmentsCreated: 0,
    };
  }

  const baseDate = new Date();
  let appointmentsCreated = 0;
  const times = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"];
  const dayOffsets = weekdayOffsets(-12, 14, baseDate);

  await db.$transaction(async (tx) => {
    const createdPatients: {
      def: DemoPrintsPatientDef;
      id: string;
      memberId: string;
    }[] = [];

    for (const def of pending) {
      const member = pickMember(def, owner, byProfession);
      const guardian = await tx.guardian.create({
        data: {
          organizationId,
          name: def.guardian.name,
          phone: def.guardian.phone,
          email: def.guardian.email,
          insurance: def.guardian.insurance,
          address: "Rua das Acácias, 250",
          zipCode: "05422-000",
        },
      });

      const patient = await tx.patient.create({
        data: {
          organizationId,
          guardianId: guardian.id,
          name: def.name,
          birthDate: birthDateForSeed(def.ageYears, def.birthdayInDays),
          sex: def.sex,
          notes: `${def.notes}\n${demoPrintsMarker(def.id)}`,
          status: def.status,
          pricingType: def.pricingType,
          price: def.price,
          members: { connect: [{ id: member.id }] },
        },
      });

      if (def.withEvaluation && def.evaluationDaysAgo != null) {
        const evaluation = buildPrintsClinicalEvaluation(
          def.name,
          def.evaluationDaysAgo,
          baseDate,
        );
        await tx.clinicalEvaluation.create({
          data: {
            patientId: patient.id,
            memberId: member.id,
            type: evaluation.type,
            date: evaluation.date,
            complaint: evaluation.complaint,
            history: evaluation.history,
            domains: JSON.stringify(evaluation.domains),
            goals: evaluation.goals,
            interventions: evaluation.interventions,
            diagnosis: evaluation.diagnosis,
            referredBy: evaluation.referredBy,
            familyContext: evaluation.familyContext,
            previousLevel: evaluation.previousLevel,
            medications: evaluation.medications,
            precautions: evaluation.precautions,
            equipment: evaluation.equipment,
            frequency: evaluation.frequency,
            dischargeCriteria: evaluation.dischargeCriteria,
          },
        });
      }

      if (def.withAnamnese) {
        await tx.anamnese.create({
          data: {
            organizationId,
            patientId: patient.id,
            formId: "anamnese-to",
            data: JSON.stringify(
              buildPrintsAnamnese(def.name, def.guardian.name),
            ),
          },
        });
      }

      createdPatients.push({
        def,
        id: patient.id,
        memberId: member.id,
      });
    }

    const active = createdPatients.filter((row) => row.def.status === "ACTIVE");
    for (let i = 0; i < dayOffsets.length; i++) {
      const offset = dayOffsets[i];
      if (offset == null) continue;
      const date = offsetIsoDate(baseDate, offset);
      const slots = offset < 0 ? 3 : 4;
      for (let slot = 0; slot < slots; slot++) {
        const row = active[(i + slot) % active.length];
        if (!row) continue;
        const time = times[slot % times.length];
        if (!time) continue;
        const past = offset < 0;
        const isAbsent = past && slot === 2 && i % 5 === 0;
        const status = past ? (isAbsent ? "ABSENT" : "COMPLETED") : "SCHEDULED";

        const appointment = await tx.appointment.create({
          data: {
            organizationId,
            patientId: row.id,
            memberId: row.memberId,
            date,
            time,
            duration: 45,
            status,
            notes: past ? "Sessão de acompanhamento." : "",
          },
        });
        appointmentsCreated += 1;

        if (status === "COMPLETED") {
          const note =
            DEMO_PRINTS_SESSION_ACTIVITIES[
              i % DEMO_PRINTS_SESSION_ACTIVITIES.length
            ];
          await tx.sessionNote.create({
            data: {
              patientId: row.id,
              memberId: row.memberId,
              appointmentId: appointment.id,
              date,
              time,
              status: "ATTENDED",
              activities: note?.activities ?? "",
              observations: note?.observations ?? "",
            },
          });
        }

        if (status === "COMPLETED" && slot === 0) {
          await tx.cashTransaction.create({
            data: {
              organizationId,
              patientId: row.id,
              memberId: row.memberId,
              type: "INCOME",
              status: "POSTED",
              amount: row.def.price,
              date,
              description: `Sessão — ${row.def.name}`,
              paymentMethod: slot % 2 === 0 ? "PIX" : "CARD",
            },
          });
        }

        if (status === "SCHEDULED" && slot === 0 && offset <= 7) {
          await tx.cashTransaction.create({
            data: {
              organizationId,
              patientId: row.id,
              memberId: row.memberId,
              type: "INCOME",
              status: "FORECAST",
              amount: row.def.price,
              date,
              description: `Previsão — ${row.def.name}`,
              paymentMethod: "PIX",
            },
          });
        }
      }
    }

    await tx.cashTransaction.createMany({
      data: [
        {
          organizationId,
          type: "EXPENSE",
          status: "POSTED",
          amount: 2800,
          date: offsetIsoDate(baseDate, -3),
          description: "Aluguel da clínica",
          paymentMethod: "TRANSFER",
        },
        {
          organizationId,
          type: "EXPENSE",
          status: "POSTED",
          amount: 420,
          date: offsetIsoDate(baseDate, -1),
          description: "Material terapêutico",
          paymentMethod: "PIX",
        },
        {
          organizationId,
          type: "EXPENSE",
          status: "FORECAST",
          amount: 380,
          date: offsetIsoDate(baseDate, 5),
          description: "Conta de energia",
          paymentMethod: "OTHER",
        },
      ],
    });
  });

  return {
    professionalsCreated,
    patientsCreated: pending.length,
    appointmentsCreated,
  };
}
