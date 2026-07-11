import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { listExercises } from "@/features/exercise/exercise.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { BibliotecaClient } from "./biblioteca-client";
import { AppPage } from "@/app/(authenticated)/_components/app-page";

export default async function BibliotecaPage() {
  let exercises: ExerciseDTO[] = [];
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    exercises = await listExercises(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar a biblioteca.";
  }

  return (
    <AppPage title="Biblioteca">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <BibliotecaClient initialExercises={exercises} />
      )}
    </AppPage>
  );
}
