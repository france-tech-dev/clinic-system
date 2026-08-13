"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { setOrganizationBillingExemptAction } from "@/server/platform/platform.actions";
import type { PlatformOrganizationDTO } from "@/server/platform/platform.actions";

function billingLabel(org: PlatformOrganizationDTO): string {
  if (org.billingExempt) return "Isenta";
  if (!org.billingStatus) return "Sem billing";
  if (org.billingPlan) return `${org.billingStatus} · ${org.billingPlan}`;
  return org.billingStatus;
}

export function PlataformaClient({
  organizations,
}: {
  organizations: PlatformOrganizationDTO[];
}) {
  const [pending, startTransition] = useTransition();

  function handleExemptChange(organizationId: string, billingExempt: boolean) {
    startTransition(async () => {
      const result = await setOrganizationBillingExemptAction({
        organizationId,
        billingExempt,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        billingExempt
          ? "Clínica com acesso completo (sem cobrança)."
          : "Isenção removida — volta a aplicar o billing.",
      );
    });
  }

  if (organizations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há clínicas registadas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {organizations.map((org) => (
        <li
          key={org.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate font-medium">{org.name}</p>
            <p className="truncate text-xs text-muted-foreground">{org.slug}</p>
            <Badge variant="secondary" className="w-fit">
              {billingLabel(org)}
            </Badge>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Acesso completo</span>
            <Switch
              checked={org.billingExempt}
              disabled={pending}
              onCheckedChange={(checked) => handleExemptChange(org.id, checked)}
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
