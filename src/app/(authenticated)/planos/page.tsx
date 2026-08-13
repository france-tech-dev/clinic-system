import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { PlanosClient } from "./planos-client";
import {
  getBillingSnapshot,
  isStripeConfigured,
} from "@/features/billing/billing.service";
import { requireOrgId } from "@/shared/lib/org-context";

export default async function PlanosPage() {
  const { organizationId } = await requireOrgId();
  const snapshot = await getBillingSnapshot(organizationId);
  const stripeReady = isStripeConfigured();

  return (
    <AppPage title="Planos">
      <div className="flex max-w-5xl flex-col gap-2">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Planos da clínica
        </h2>
        <p className="text-sm text-muted-foreground">
          Veja a assinatura atual, escolha um plano ou gira o pagamento e o
          cancelamento no portal Stripe.
        </p>
      </div>
      <div className="max-w-5xl">
        <PlanosClient snapshot={snapshot} stripeReady={stripeReady} />
      </div>
    </AppPage>
  );
}
