import "dotenv/config";
import { db } from "../src/shared/lib/prisma";
import { DEMO_PRINTS_PASSWORD, DEMO_PRINTS_PROFESSIONALS } from "./demo-prints";
import { ensureDemoPatient } from "./seed-demo-patient";
import { ensureDemoPrints } from "./seed-demo-prints";

async function main() {
  const organization = await db.organization.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (!organization) {
    throw new Error(
      "Nenhuma organização encontrada. Faça login e crie uma conta antes do seed.",
    );
  }

  const demoPatient = await ensureDemoPatient(organization.id);
  if (demoPatient.created) {
    console.log(
      `Paciente de demonstração criado: ${demoPatient.patientName} (${demoPatient.patientId})`,
    );
  } else {
    console.log(
      `Paciente de demonstração já existia: ${demoPatient.patientName} (${demoPatient.patientId})`,
    );
  }

  const prints = await ensureDemoPrints(organization.id);
  console.log(
    `Roster para prints: ${prints.patientsCreated} paciente(s), ${prints.appointmentsCreated} agendamento(s), ${prints.professionalsCreated} profissional(is).`,
  );
  if (prints.professionalsCreated > 0) {
    console.log("Profissionais demo (senha compartilhada):");
    for (const spec of DEMO_PRINTS_PROFESSIONALS) {
      console.log(`  ${spec.name} <${spec.email}> — ${DEMO_PRINTS_PASSWORD}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
