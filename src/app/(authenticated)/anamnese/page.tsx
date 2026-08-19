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
  filterAnamneseCatalogByProfessions,
  type ProfessionAnamneseCatalogItem,
} from "@/features/anamnese/forms";
import { HEALTH_PROFESSION_IDS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";

const professionIdSet = new Set<string>(HEALTH_PROFESSION_IDS);

function sortViewerProfessionFirst(
  catalog: ProfessionAnamneseCatalogItem[],
  viewerProfessionId: string | null,
): ProfessionAnamneseCatalogItem[] {
  if (!viewerProfessionId) return catalog;
  return [...catalog].sort((a, b) => {
    if (a.professionId === viewerProfessionId) return -1;
    if (b.professionId === viewerProfessionId) return 1;
    return 0;
  });
}

export default async function AnamneseHubPage() {
  let error: string | null = null;
  let catalog: ProfessionAnamneseCatalogItem[] = [];
  let viewerProfessionId: string | null = null;
  let canWriteAnamnese = true;

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
      filterAnamneseCatalogByProfessions(activeProfessionIds),
      viewerProfessionId,
    );
    canWriteAnamnese =
      access.mode === "full" && access.features.includes("anamnese");
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as anamneses.";
  }

  const showViewerBadge = catalog.length > 1;

  return (
    <AppPage title="Anamnese">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Formulários de anamnese da clínica. Abra o da sua área e escolha o
          paciente no passo seguinte.
        </p>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertAction>
              <Button asChild size="sm" variant="outline">
                <Link href={paths.anamnese.root}>Tentar de novo</Link>
              </Button>
            </AlertAction>
          </Alert>
        ) : (
          <>
            {canWriteAnamnese ? null : (
              <Alert>
                <AlertTitle>Fora do plano atual</AlertTitle>
                <AlertDescription>
                  Anamnese por especialidade faz parte do Pro. Pode consultar o
                  catálogo; para preencher,{" "}
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
                    as anamneses disponíveis.
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
                    items={item.forms}
                    highlightLabel={
                      showViewerBadge &&
                      item.professionId === viewerProfessionId
                        ? "Sua área"
                        : undefined
                    }
                    labels={{
                      singular: "anamnese",
                      plural: "anamneses",
                      emptyDetail:
                        "Ainda não há anamnese cadastrada para esta especialidade.",
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
