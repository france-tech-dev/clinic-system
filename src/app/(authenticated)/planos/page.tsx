import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { PlanosClient } from "./planos-client";
import {
  getBillingSnapshot,
  isStripeConfigured,
} from "@/features/billing/billing.service";
import { requireOrgId } from "@/shared/lib/org-context";

type PlanosPageProps = {
  searchParams: Promise<{ sucesso?: string }>;
};

export default async function PlanosPage({ searchParams }: PlanosPageProps) {
  const { organizationId } = await requireOrgId();
  const [{ sucesso }, snapshot] = await Promise.all([
    searchParams,
    getBillingSnapshot(organizationId),
  ]);
  const stripeReady = isStripeConfigured();

  return (
    <AppPage title="Planos">
      <div className="flex max-w-5xl flex-col gap-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Compare os planos
        </h2>
        <PlanosClient
          snapshot={snapshot}
          stripeReady={stripeReady}
          checkoutSuccess={sucesso === "1"}
        />
      </div>
    </AppPage>
  );
}
