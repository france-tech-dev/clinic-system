import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getDashboardData } from "@/features/dashboard/dashboard.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ensureDefaultExercises } from "@/shared/lib/seed-exercises";
import { PainelContent } from "./_components/painel-content";

export default async function PainelPage() {
  let data = null;
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    await ensureDefaultExercises(organizationId);
    data = await getDashboardData(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o painel.";
  }

  return (
    <AppPage title="Painel">
      <PainelContent data={data} error={error} />
    </AppPage>
  );
}
