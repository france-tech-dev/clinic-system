import { paths } from "@/shared/constants/paths";
import { revalidatePath } from "next/cache";

export function revalidatePatientPaths(patientId?: string) {
  revalidatePath(paths.pacientes);
  revalidatePath(paths.dashboard);
  revalidatePath(paths.agenda);
  if (patientId) revalidatePath(paths.paciente(patientId));
}
