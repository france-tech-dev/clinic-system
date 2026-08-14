"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { IconCheck } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  BILLING_PLAN_DEFS,
  STARTER_HIGHLIGHTS,
  type BillingPlanId,
  type BillingStatusId,
} from "@/shared/constants/billing-plans";
import {
  createBillingPortalSessionAction,
  createSubscribeCheckoutAction,
} from "@/features/billing/billing.actions";
import type { BillingSnapshotDTO } from "@/features/billing/billing.types";

const STATUS_LABEL: Record<BillingStatusId, string> = {
  trialing: "Em período de teste",
  active: "Ativo",
  past_due: "Pagamento pendente",
  canceled: "Cancelado",
  unpaid: "Não pago",
};

const STARTER_HIGHLIGHT_SET = new Set<string>(STARTER_HIGHLIGHTS);

function planName(plan: BillingPlanId | null): string {
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
  planId: BillingPlanId,
): boolean {
  if (snapshot.plan !== planId) return false;
  return snapshot.status === "active" || snapshot.status === "trialing";
}

function canChangePlan(snapshot: BillingSnapshotDTO): boolean {
  return snapshot.status === "active" || snapshot.status === "past_due";
}

function subscriptionDescription(snapshot: BillingSnapshotDTO): string {
  if (snapshot.billingExempt) {
    return "Esta clínica não é cobrada pela plataforma.";
  }
  if (snapshot.isLegacy) {
    return "Esta clínica não usa cobrança automática.";
  }
  if (snapshot.status === "trialing") {
    return "Todos os recursos estão liberados durante o teste.";
  }
  if (snapshot.status === "past_due") {
    return "Não conseguimos cobrar a mensalidade.";
  }
  if (snapshot.status === "unpaid") {
    return "A mensalidade não foi paga.";
  }
  if (snapshot.status === "canceled") {
    return "A assinatura desta clínica foi encerrada.";
  }
  if (snapshot.status === "active") {
    return "Mensalidade em dia.";
  }
  return "Ainda não há plano escolhido.";
}

function subscriptionHint(snapshot: BillingSnapshotDTO): string | null {
  if (snapshot.status === "past_due") {
    return "Atualize o pagamento para manter a edição dos dados.";
  }
  if (snapshot.status === "canceled" || snapshot.status === "unpaid") {
    return "Os dados continuam visíveis. Escolha um plano para voltar a editar.";
  }
  return null;
}

function subscribeLabel(
  snapshot: BillingSnapshotDTO,
  current: boolean,
): string {
  if (current) return "Plano atual";
  if (snapshot.status === "trialing") return "Escolher este plano";
  if (canChangePlan(snapshot)) return "Mudar para este plano";
  return "Assinar agora";
}

export function PlanosClient({
  snapshot,
  stripeReady,
  checkoutSuccess,
}: {
  snapshot: BillingSnapshotDTO;
  stripeReady: boolean;
  checkoutSuccess: boolean;
}) {
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [portalPending, setPortalPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubscribe(plan: BillingPlanId) {
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

  const trialEndLabel = formatTrialEnd(snapshot.trialEndsAt);
  const hint = subscriptionHint(snapshot);
  const canSubscribe =
    stripeReady && !snapshot.billingExempt && !snapshot.isLegacy;

  return (
    <div className="flex flex-col gap-6">
      {checkoutSuccess ? (
        <Alert>
          <AlertTitle>Plano confirmado</AlertTitle>
          <AlertDescription>
            Confira a assinatura atual abaixo.
          </AlertDescription>
        </Alert>
      ) : null}

      {!stripeReady && !snapshot.billingExempt && !snapshot.isLegacy ? (
        <Alert>
          <AlertTitle>Pagamentos indisponíveis</AlertTitle>
          <AlertDescription>
            Não é possível assinar ou alterar o plano agora. Tente mais tarde.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Assinatura atual</CardTitle>
          <CardDescription>{subscriptionDescription(snapshot)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-medium">{planName(snapshot.plan)}</p>
            {snapshot.billingExempt ? (
              <Badge variant="secondary">Isenta</Badge>
            ) : snapshot.status ? (
              <Badge variant="secondary">{STATUS_LABEL[snapshot.status]}</Badge>
            ) : null}
          </div>
          {snapshot.status === "trialing" && trialEndLabel ? (
            <p className="text-sm text-muted-foreground">
              Teste gratuito até {trialEndLabel}. A cobrança só começa depois
              desta data, se houver cartão.
            </p>
          ) : null}
          {hint ? (
            <p className="text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </CardContent>
        {snapshot.canManageBilling ? (
          <CardFooter>
            <Button
              variant="outline"
              disabled={!stripeReady || isPending}
              onClick={handleManageBilling}
            >
              {portalPending ? <Spinner data-icon="inline-start" /> : null}
              Gerenciar pagamento ou cancelar
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <div className="grid items-start gap-4 md:grid-cols-3">
        {BILLING_PLAN_DEFS.map((plan) => {
          const current = isCurrentPlan(snapshot, plan.id);
          const pending = pendingPlan === plan.id;
          return (
            <Card
              key={plan.id}
              className={current ? "ring-primary" : undefined}
              aria-current={current ? "true" : undefined}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {current ? <Badge>Atual</Badge> : null}
                </CardTitle>
                <CardDescription>
                  {plan.maxProfessionals
                    ? `Até ${plan.maxProfessionals} profissionais`
                    : "Profissionais ilimitados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2">
                  {plan.highlights.map((item) => {
                    const isExtra =
                      plan.id !== "starter" && !STARTER_HIGHLIGHT_SET.has(item);
                    return (
                      <li key={item} className="flex items-start gap-2">
                        <IconCheck className="mt-0.5 size-4 shrink-0" />
                        <span
                          className={
                            isExtra
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
              {snapshot.billingExempt || snapshot.isLegacy ? null : (
                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={!canSubscribe || isPending || current}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {pending ? <Spinner data-icon="inline-start" /> : null}
                    {subscribeLabel(snapshot, current)}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
