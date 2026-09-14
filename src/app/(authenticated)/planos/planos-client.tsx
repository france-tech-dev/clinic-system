"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { IconCheck } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  BILLING_PLAN_DEFS,
  EXTRA_SEAT_PRICE_BRL,
  planDef,
} from "@/shared/constants/billing-plans";
import {
  createBillingPortalSessionAction,
  createSubscribeCheckoutAction,
  setExtraSeatsAction,
} from "@/domains/billing/billing.actions";
import type { BillingSnapshotDTO } from "@/domains/billing/billing.types";
import { formatBrl } from "@/shared/lib/money-utils";
import { cn } from "@/shared/lib/utils";
import {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

const STATUS_LABEL: Record<BillingStatus, string> = {
  [BillingStatus.TRIALING]: "Em período de teste",
  [BillingStatus.ACTIVE]: "Ativo",
  [BillingStatus.PAST_DUE]: "Pagamento pendente",
  [BillingStatus.CANCELLED]: "Cancelado",
  [BillingStatus.UNPAID]: "Não pago",
};

function planName(plan: BillingPlan | null): string {
  if (!plan) return "Nenhum plano escolhido";
  return BILLING_PLAN_DEFS.find((item) => item.id === plan)?.name ?? plan;
}

function formatTrialEnd(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isCurrentPlan(
  snapshot: BillingSnapshotDTO,
  planId: BillingPlan,
): boolean {
  if (snapshot.plan !== planId) return false;
  return (
    snapshot.status === BillingStatus.ACTIVE ||
    snapshot.status === BillingStatus.TRIALING
  );
}

function canChangePlan(snapshot: BillingSnapshotDTO): boolean {
  return (
    snapshot.status === BillingStatus.ACTIVE ||
    snapshot.status === BillingStatus.PAST_DUE
  );
}

function isPaymentProblem(status: BillingStatus | null): boolean {
  return (
    status === BillingStatus.PAST_DUE || status === BillingStatus.UNPAID
  );
}

function subscriptionDescription(snapshot: BillingSnapshotDTO): string {
  if (snapshot.billingExempt) {
    return "Esta clínica não é cobrada pela plataforma.";
  }
  if (snapshot.isLegacy) {
    return "Esta clínica não usa cobrança automática.";
  }
  if (snapshot.status === BillingStatus.TRIALING) {
    return "Todos os recursos estão liberados durante o teste.";
  }
  if (snapshot.status === BillingStatus.PAST_DUE) {
    return "Não conseguimos cobrar a mensalidade.";
  }
  if (snapshot.status === BillingStatus.UNPAID) {
    return "A mensalidade não foi paga.";
  }
  if (snapshot.status === BillingStatus.CANCELLED) {
    return "A assinatura desta clínica foi encerrada.";
  }
  if (snapshot.status === BillingStatus.ACTIVE) {
    return "Mensalidade em dia. Todos os módulos estão incluídos.";
  }
  return "Ainda não há plano escolhido.";
}

function subscriptionHint(snapshot: BillingSnapshotDTO): string | null {
  if (snapshot.status === BillingStatus.PAST_DUE) {
    return "Atualize o pagamento para manter a edição dos dados.";
  }
  if (
    snapshot.status === BillingStatus.CANCELLED ||
    snapshot.status === BillingStatus.UNPAID
  ) {
    return "Os dados continuam visíveis. Escolha um plano para voltar a editar.";
  }
  return null;
}

function subscribeLabel(
  snapshot: BillingSnapshotDTO,
  current: boolean,
): string {
  if (current) return "Plano atual";
  if (snapshot.status === BillingStatus.TRIALING) return "Escolher este plano";
  if (canChangePlan(snapshot)) return "Mudar para este plano";
  return "Assinar agora";
}

function seatDescription(plan: (typeof BILLING_PLAN_DEFS)[number]): string {
  const base = `até ${plan.includedProfessionals} profissionais`;
  if (!plan.extraSeatAllowed) return base;
  return `${base} · adicional ${formatBrl(EXTRA_SEAT_PRICE_BRL)}/mês`;
}

function FeatureItem({ item }: { item: string }) {
  return (
    <li className="flex items-start gap-2">
      <IconCheck
        aria-hidden
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <span className="text-muted-foreground">{item}</span>
    </li>
  );
}

export function PlanosClient({
  snapshot: initialSnapshot,
  stripeReady,
  checkoutSuccess,
}: {
  snapshot: BillingSnapshotDTO;
  stripeReady: boolean;
  checkoutSuccess: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [portalPending, setPortalPending] = useState(false);
  const [extraPending, setExtraPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubscribe(plan: BillingPlan) {
    startTransition(async () => {
      setPendingPlan(plan);
      const result = await createSubscribeCheckoutAction({ plan });
      setPendingPlan(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      window.location.assign(result.data.url);
    });
  }

  function handleManageBilling() {
    startTransition(async () => {
      setPortalPending(true);
      const result = await createBillingPortalSessionAction();
      setPortalPending(false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      window.location.assign(result.data.url);
    });
  }

  function handleAddExtraSeat() {
    startTransition(async () => {
      setExtraPending(true);
      const result = await setExtraSeatsAction({
        quantity: snapshot.extraSeats + 1,
      });
      setExtraPending(false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setSnapshot(result.data);
      toast.success("Profissional adicional incluído na assinatura.");
    });
  }

  const trialEndLabel = formatTrialEnd(snapshot.trialEndsAt);
  const hint = subscriptionHint(snapshot);
  const canSubscribe =
    stripeReady && !snapshot.billingExempt && !snapshot.isLegacy;
  const showSubscribe = !snapshot.billingExempt && !snapshot.isLegacy;
  const canManageExtras =
    canSubscribe &&
    snapshot.plan != null &&
    planDef(snapshot.plan).extraSeatAllowed &&
    (snapshot.status === BillingStatus.ACTIVE ||
      snapshot.status === BillingStatus.PAST_DUE);

  const currentPlanDef = snapshot.plan ? planDef(snapshot.plan) : null;

  return (
    <div className="flex flex-col gap-4">
      {checkoutSuccess ? (
        <Alert>
          <AlertTitle>Plano confirmado</AlertTitle>
          <AlertDescription>
            Confira a assinatura atual abaixo.
          </AlertDescription>
        </Alert>
      ) : null}

      {!stripeReady && showSubscribe ? (
        <Alert>
          <AlertTitle>Pagamentos indisponíveis</AlertTitle>
          <AlertDescription>
            Não é possível assinar ou alterar o plano agora. Tente mais tarde.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle>Assinatura atual</CardTitle>
          <CardDescription>{subscriptionDescription(snapshot)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{planName(snapshot.plan)}</p>
            {snapshot.billingExempt ? (
              <Badge variant="secondary">Isenta</Badge>
            ) : snapshot.status ? (
              <Badge
                variant={
                  isPaymentProblem(snapshot.status)
                    ? "destructive"
                    : "secondary"
                }
              >
                {STATUS_LABEL[snapshot.status]}
              </Badge>
            ) : null}
          </div>
          {snapshot.maxProfessionals != null ? (
            <p className="text-sm text-muted-foreground">
              Até {snapshot.maxProfessionals} profissionais
              {currentPlanDef && snapshot.extraSeats > 0
                ? ` (${currentPlanDef.includedProfessionals} incluídos + ${snapshot.extraSeats} adicionais)`
                : ""}
              .
            </p>
          ) : null}
          {snapshot.status === BillingStatus.TRIALING && trialEndLabel ? (
            <p className="text-sm text-muted-foreground">
              Teste gratuito até {trialEndLabel}. A cobrança só começa depois
              desta data, se houver cartão.
            </p>
          ) : null}
          {hint ? (
            <p className="text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </CardContent>
        {snapshot.canManageBilling || canManageExtras ? (
          <CardFooter className="flex flex-wrap gap-2">
            {snapshot.canManageBilling ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!stripeReady || isPending}
                onClick={handleManageBilling}
              >
                {portalPending ? <Spinner data-icon="inline-start" /> : null}
                Gerenciar pagamento ou cancelar
              </Button>
            ) : null}
            {canManageExtras ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!stripeReady || isPending}
                onClick={handleAddExtraSeat}
              >
                {extraPending ? <Spinner data-icon="inline-start" /> : null}
                +1 profissional ({formatBrl(EXTRA_SEAT_PRICE_BRL)}/mês)
              </Button>
            ) : null}
          </CardFooter>
        ) : null}
      </Card>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {BILLING_PLAN_DEFS.map((plan) => {
          const current = isCurrentPlan(snapshot, plan.id);
          const pending = pendingPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={cn("h-full", current && "ring-2 ring-primary")}
              aria-current={current ? "true" : undefined}
            >
              <CardHeader className="border-b">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {current ? (
                  <CardAction>
                    <Badge>Atual</Badge>
                  </CardAction>
                ) : null}
                <CardDescription>
                  {formatBrl(plan.priceMonthlyBrl)}
                  /mês
                  {" · "}
                  {seatDescription(plan)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-(--card-spacing)">
                <ul className="flex flex-col gap-2">
                  {plan.highlights.map((item) => (
                    <FeatureItem key={item} item={item} />
                  ))}
                </ul>
              </CardContent>
              {showSubscribe ? (
                <CardFooter className="mt-auto">
                  <Button
                    className="w-full"
                    variant={current ? "outline" : "default"}
                    disabled={!canSubscribe || isPending || current}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {pending ? <Spinner data-icon="inline-start" /> : null}
                    {subscribeLabel(snapshot, current)}
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
