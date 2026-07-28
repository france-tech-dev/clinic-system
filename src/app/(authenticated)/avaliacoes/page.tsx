import Link from "next/link";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { ProfessionCatalogCard } from "@/components/profession-catalog-card";
import { listTeamMembers } from "@/features/team/team.service";
import { filterEvaluationCatalogByProfessions } from "@/features/protocol/evaluation-modules";
import { HEALTH_PROFESSION_IDS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { Button } from "@/components/ui/button";

const professionIdSet = new Set<string>(HEALTH_PROFESSION_IDS);

export default async function AvaliacoesPage() {
  let error: string | null = null;
  let catalog = filterEvaluationCatalogByProfessions([]);

  try {
    const { organizationId } = await requireOrgId();
    const members = await listTeamMembers(organizationId);
    const activeProfessionIds = new Set(
      members
        .filter(
          (member) =>
            member.status === "active" &&
            member.profession &&
            professionIdSet.has(member.profession),
        )
        .map((member) => member.profession as string),
    );
    catalog = filterEvaluationCatalogByProfessions(activeProfessionIds);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as avaliações.";
  }

  return (
    <AppPage title="Avaliações">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Escolha a profissão e a avaliação a aplicar ao paciente. As áreas
          refletem as profissões ativas da clínica.
        </p>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : catalog.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="font-serif text-lg font-medium">
              Nenhuma profissão ativa na clínica
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre profissionais com a respectiva profissão para ver as
              avaliações disponíveis.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href={paths.profissionais}>Ir para Profissionais</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {catalog.map((item) => (
              <ProfessionCatalogCard
                key={item.professionId}
                professionId={item.professionId}
                label={item.label}
                council={item.council}
                items={item.assessments}
                labels={{
                  singular: "avaliação",
                  plural: "avaliações",
                  emptyDetail:
                    "Ainda não há avaliações cadastradas para esta profissão.",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppPage>
  );
}
