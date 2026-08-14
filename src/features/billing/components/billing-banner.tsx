import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { paths } from "@/shared/constants/paths";
import type { BillingSnapshotDTO } from "../billing.types";

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function shouldShowBillingBanner(snapshot: BillingSnapshotDTO): boolean {
  if (snapshot.isLegacy || snapshot.billingExempt) return false;
  if (snapshot.mode === "full" && snapshot.status === "active") return false;
  // Trial com plano já escolhido: não insistir em "Assinar agora".
  if (snapshot.status === "trialing" && snapshot.plan) return false;
  return (
    snapshot.status === "trialing" ||
    snapshot.mode === "read_only" ||
    snapshot.status === "past_due"
  );
}

export function BillingBanner({ snapshot }: { snapshot: BillingSnapshotDTO }) {
  if (!shouldShowBillingBanner(snapshot)) return null;

  if (snapshot.status === "trialing") {
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

  if (snapshot.status === "past_due") {
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
