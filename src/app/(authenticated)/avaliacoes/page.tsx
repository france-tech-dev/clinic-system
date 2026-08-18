import Link from "next/link";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { ProfessionCatalogCard } from "@/components/profession-catalog-card";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getBillingAccess } from "@/server/billing/access";
import { listTeamMembers } from "@/features/team/team.service";
import {
  filterEvaluationCatalogByProfessions,
  type ProfessionEvaluationCatalogItem,
} from "@/features/protocol/evaluation-modules";
import { HEALTH_PROFESSION_IDS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";

const professionIdSet = new Set<string>(HEALTH_PROFESSION_IDS);

function sortViewerProfessionFirst(
  catalog: ProfessionEvaluationCatalogItem[],
  viewerProfessionId: string | null,
): ProfessionEvaluationCatalogItem[] {
  if (!viewerProfessionId) return catalog;
  return [...catalog].sort((a, b) => {
    if (a.professionId === viewerProfessionId) return -1;
    if (b.professionId === viewerProfessionId) return 1;
    return 0;
  });
}

export default async function AvaliacoesPage() {
  let error: string | null = null;
  let catalog: ProfessionEvaluationCatalogItem[] = [];
  let viewerProfessionId: string | null = null;
  let canWriteEvaluations = true;

  try {
    const { organizationId, userId } = await requireOrgId();
    const [members, access] = await Promise.all([
      listTeamMembers(organizationId),
      getBillingAccess(organizationId),
    ]);
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
    viewerProfessionId =
      members.find((member) => member.userId === userId)?.profession ?? null;
    catalog = sortViewerProfessionFirst(
      filterEvaluationCatalogByProfessions(activeProfessionIds),
      viewerProfessionId,
    );
    canWriteEvaluations =
      access.mode === "full" && access.features.includes("avaliacoes");
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as avaliações.";
  }

  const showViewerBadge = catalog.length > 1;

  return (
    <AppPage title="Avaliações">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Protocolos estruturados da clínica. Abra o instrumento da sua área e
          escolha o paciente no passo seguinte.
        </p>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertAction>
              <Button asChild size="sm" variant="outline">
                <Link href={paths.avaliacoes.root}>Tentar de novo</Link>
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <>
            {canWriteEvaluations ? null : (
              <Alert>
                <AlertTitle>Fora do plano atual</AlertTitle>
                <AlertDescription>
                  Avaliações estruturadas (GMFM-88) fazem parte do Enterprise.
                  Pode consultar o catálogo; para registrar,{" "}
                  <Link href={paths.planos}>mude de plano</Link>.
                </AlertDescription>
              </Alert>
            )}

            {catalog.length === 0 ? (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyTitle>Nenhuma profissão ativa</EmptyTitle>
                  <EmptyDescription>
                    Cadastre profissionais com a respectiva profissão para ver
                    as avaliações disponíveis.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild size="sm">
                    <Link href={paths.profissionais}>
                      Ir para Profissionais
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.map((item) => (
                  <ProfessionCatalogCard
                    key={item.professionId}
                    professionId={item.professionId}
                    label={item.label}
                    council={item.council}
                    items={item.assessments}
                    highlightLabel={
                      showViewerBadge &&
                      item.professionId === viewerProfessionId
                        ? "Sua área"
                        : undefined
                    }
                    labels={{
                      singular: "avaliação",
                      plural: "avaliações",
                      emptyDetail:
                        "Ainda não há avaliação cadastrada para esta especialidade.",
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppPage>
  );
}
