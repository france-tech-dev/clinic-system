import "dotenv/config";
import { db } from "../src/shared/lib/prisma";
import { ensureDemoPatient } from "./seed-demo-patient";

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

  const result = await ensureDemoPatient(organization.id);

  if (result.created) {
    console.log(
      `Paciente de demonstração criado: ${result.patientName} (${result.patientId})`,
    );
  } else {
    console.log(
      `Paciente de demonstração já existia: ${result.patientName} (${result.patientId})`,
    );
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
