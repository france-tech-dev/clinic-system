import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listStudyCards } from "@/features/study/study.service";
import type { StudyCardDTO } from "@/features/study/study.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { EstudoClient } from "./estudo-client";

export default async function EstudoPage() {
  let error: string | null = null;
  let cards: StudyCardDTO[] = [];

  try {
    const { organizationId } = await requireOrgId();
    cards = await listStudyCards(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as notas de estudo.";
  }

  return (
    <AppPage title="Estudo">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <EstudoClient initialCards={cards} />
      )}
    </AppPage>
  );
}
