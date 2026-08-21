import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  getCatalogEvaluation,
  getEvaluationModule,
} from "@/features/protocol/evaluation-modules";
import { listPatients } from "@/features/patient/patient.service";
import { getBillingAccess } from "@/server/billing/access";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { paths } from "@/shared/constants/paths";

export default async function AvaliacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ avaliacao: string }>;
  searchParams: Promise<{ paciente?: string }>;
}) {
  const { avaliacao: avaliacaoId } = await params;
  const assessment = getCatalogEvaluation(avaliacaoId);
  const ui = getEvaluationModule(avaliacaoId);
  if (!assessment || !ui) notFound();

  const query = await searchParams;
  const initialPatientId = query.paciente ?? null;

  let error: string | null = null;
  let content: ReactNode = null;
  let canWrite = true;

  try {
    const { organizationId } = await requireOrgId();
    const [patients, access] = await Promise.all([
      listPatients(organizationId),
      getBillingAccess(organizationId),
    ]);
    canWrite = access.mode === "full" && access.features.includes("avaliacoes");
    content = await ui.render({
      organizationId,
      patients,
      initialPatientId,
      canWrite,
    });
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : `Não foi possível carregar ${assessment.name}.`;
  }

  return (
    <AppPage title={assessment.name}>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button asChild size="sm" variant="outline">
              <Link href={paths.avaliacoes.byId(avaliacaoId)}>
                Tentar de novo
              </Link>
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          <Link
            href={paths.avaliacoes.root}
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Avaliações
          </Link>
          {canWrite ? null : (
            <Alert>
              <AlertTitle>Fora do plano atual</AlertTitle>
              <AlertDescription>
                Pode consultar o histórico. Para registrar ou editar,{" "}
                <Link href={paths.planos}>mude de plano</Link>.
              </AlertDescription>
            </Alert>
          )}
          {content}
        </div>
      )}
    </AppPage>
  );
}
