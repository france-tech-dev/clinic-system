"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  BILLING_PLAN_DEFS,
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

export function PlanosClient({
  snapshot,
  stripeReady,
}: {
  snapshot: BillingSnapshotDTO;
  stripeReady: boolean;
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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assinatura atual</CardTitle>
          <CardDescription>
            {snapshot.billingExempt
              ? "Esta clínica está isenta de cobrança na plataforma."
              : snapshot.isLegacy
                ? "Clínica sem faturação Stripe (legado)."
                : "Estado da mensalidade desta clínica."}
          </CardDescription>
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
          {snapshot.status === "canceled" ? (
            <p className="text-sm text-muted-foreground">
              Assinatura cancelada. Escolha um plano abaixo para voltar a
              assinar.
            </p>
          ) : null}
        </CardContent>
        {snapshot.canManageBilling ? (
          <CardFooter>
            <Button
              variant="outline"
              disabled={!stripeReady || isPending}
              onClick={handleManageBilling}
            >
              {portalPending ? "A abrir…" : "Gerir pagamento e cancelar"}
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <div className="grid items-start gap-4 md:grid-cols-3">
        {BILLING_PLAN_DEFS.map((plan) => {
          const current = isCurrentPlan(snapshot, plan.id);
          return (
            <Card key={plan.id}>
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
                <ul className="flex flex-col gap-1.5 text-muted-foreground">
                  {plan.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={!stripeReady || isPending || current}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {current
                    ? "Plano atual"
                    : pendingPlan === plan.id
                      ? "A redirecionar…"
                      : snapshot.status === "trialing"
                        ? "Escolher este plano"
                        : "Assinar agora"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
