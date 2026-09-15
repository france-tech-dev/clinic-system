import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  BILLING_PLAN_DEFS,
  INCLUDED_IN_ALL_PLANS,
  INCLUDED_SECTION_TITLE,
  TRIAL_DAYS,
  planSeatLabel,
  type BillingPlanDef,
} from "@/shared/constants/billing-plans";
import { formatBrl } from "@/shared/lib/money-utils";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { BillingPlan } from "@prisma/enums";

function pricePerProfessionalHint(plan: BillingPlanDef): string | null {
  if (plan.id !== BillingPlan.PRO) return null;
  const per = Math.round(plan.priceMonthlyBrl / plan.includedProfessionals);
  return `Equivalente a aproximadamente ${formatBrl(per)} por profissional`;
}

function PlanCard({
  plan,
  featured,
}: {
  plan: BillingPlanDef;
  featured: boolean;
}) {
  const perHint = pricePerProfessionalHint(plan);

  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8",
        featured && "border-primary/40 ring-1 ring-primary/25",
      )}
    >
      <header>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-2xl font-semibold">{plan.name}</h3>
          {featured ? (
            <span className="text-xs font-medium text-primary">
              Mais indicado
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {formatBrl(plan.priceMonthlyBrl)}
          </span>
          <span className="text-sm text-muted-foreground">/mês</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {planSeatLabel(plan)}
        </p>
        {perHint ? (
          <p className="mt-1 text-xs text-muted-foreground">{perHint}</p>
        ) : null}
      </header>

      <ul className="mt-8 flex-1 space-y-2.5 text-sm">
        {plan.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <IconCheck
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        className="mt-10 w-full"
        variant={featured ? "default" : "outline"}
        asChild
      >
        <Link href={paths.auth.signup}>Iniciar período de teste</Link>
      </Button>
    </article>
  );
}

export function LandingPlans() {
  return (
    <section
      id="planos"
      aria-labelledby="landing-plans-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <h2
            id="landing-plans-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            Planos para a sua clínica
          </h2>
          <p className="mt-4 text-muted-foreground">
            {TRIAL_DAYS} dias de acesso completo, sem cartão. Em seguida,
            selecione o plano conforme o número de profissionais da equipe.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
          <h3 className="font-medium">{INCLUDED_SECTION_TITLE}</h3>
          <ul className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
            {INCLUDED_IN_ALL_PLANS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <IconCheck
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {BILLING_PLAN_DEFS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featured={Boolean(plan.recommended)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
