import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { paths } from "@/shared/constants/paths";
import type { BillingSnapshotDTO } from "../billing.types";
import { BillingStatus } from "../../../../prisma/generated/prisma/enums";

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function shouldShowBillingBanner(snapshot: BillingSnapshotDTO): boolean {
  if (snapshot.isLegacy || snapshot.billingExempt) return false;
  if (snapshot.mode === "full" && snapshot.status === BillingStatus.ACTIVE)
    return false;
  // Trial com plano já escolhido: não insistir em "Assinar agora".
  if (snapshot.status === BillingStatus.TRIALING && snapshot.plan) return false;
  return (
    snapshot.status === BillingStatus.TRIALING ||
    snapshot.mode === "read_only" ||
    snapshot.status === BillingStatus.PAST_DUE
  );
}

export function BillingBanner({ snapshot }: { snapshot: BillingSnapshotDTO }) {
  if (!shouldShowBillingBanner(snapshot)) return null;

  if (snapshot.status === BillingStatus.TRIALING) {
    const days = trialDaysLeft(snapshot.trialEndsAt);
    return (
      <Alert>
        <AlertTitle>Período de teste</AlertTitle>
        <AlertDescription>
          {days == null
            ? "O teste grátis está ativo com todos os recursos liberados."
            : days === 1
              ? "Falta 1 dia de teste grátis."
              : `Faltam ${days} dias de teste grátis.`}{" "}
          <Link href={paths.planos}>Assinar agora</Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (snapshot.mode === "read_only") {
    return (
      <Alert>
        <AlertTitle>Teste encerrado</AlertTitle>
        <AlertDescription>
          Pode consultar os dados. Para criar ou editar, escolha um plano.{" "}
          <Link href={paths.planos}>Ver planos</Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (snapshot.status === BillingStatus.PAST_DUE) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Pagamento pendente</AlertTitle>
        <AlertDescription>
          Não conseguimos cobrar a mensalidade. Atualize o pagamento em{" "}
          <Link href={paths.planos}>planos</Link>.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
