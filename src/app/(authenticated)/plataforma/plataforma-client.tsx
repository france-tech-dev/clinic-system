"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  BILLING_PLAN_DEFS,
} from "@/shared/constants/billing-plans";
import {
  deletePlatformOrganizationAction,
  setOrganizationBillingExemptAction,
} from "@/server/platform/platform.actions";
import type { PlatformOrganizationDTO } from "@/server/platform/platform.actions";
import { cn } from "@/shared/lib/utils";
import {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

const STATUS_LABEL: Record<BillingStatus, string> = {
  [BillingStatus.TRIALING]: "Em teste",
  [BillingStatus.ACTIVE]: "Ativo",
  [BillingStatus.PAST_DUE]: "Pagamento pendente",
  [BillingStatus.CANCELLED]: "Cancelado",
  [BillingStatus.UNPAID]: "Não pago",
};

type FleetFilter = "all" | "exempt" | "trial" | "no_billing" | "active";

type ConfirmExempt = {
  org: PlatformOrganizationDTO;
  nextExempt: boolean;
};

type ConfirmDelete = {
  org: PlatformOrganizationDTO;
};

function isBillingStatus(value: string | null): value is BillingStatus {
  return (
    value === BillingStatus.TRIALING ||
    value === BillingStatus.ACTIVE ||
    value === BillingStatus.PAST_DUE ||
    value === BillingStatus.CANCELLED ||
    value === BillingStatus.UNPAID
  );
}

function planLabel(plan: string | null): string | null {
  if (!plan) return null;
  return (
    BILLING_PLAN_DEFS.find((item) => item.id === (plan as BillingPlan))
      ?.name ?? plan
  );
}

function statusLabel(status: string | null): string | null {
  if (!status) return null;
  if (isBillingStatus(status)) return STATUS_LABEL[status];
  return status;
}

function billingBadge(org: PlatformOrganizationDTO): string {
  if (org.billingExempt) return "Isenta";
  if (!org.billingStatus) return "Sem faturação";
  const status = statusLabel(org.billingStatus);
  const plan = planLabel(org.billingPlan);
  if (status && plan) return `${status} · ${plan}`;
  return status ?? "Sem faturação";
}

function formatIsoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function matchesFilter(org: PlatformOrganizationDTO, filter: FleetFilter) {
  switch (filter) {
    case "exempt":
      return org.billingExempt;
    case "trial":
      return !org.billingExempt && org.billingStatus === BillingStatus.TRIALING;
    case "no_billing":
      return !org.billingExempt && !org.billingStatus;
    case "active":
      return !org.billingExempt && org.billingStatus === BillingStatus.ACTIVE;
    default:
      return true;
  }
}

const FILTERS: { id: FleetFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "exempt", label: "Isentas" },
  { id: "trial", label: "Em teste" },
  { id: "no_billing", label: "Sem faturação" },
  { id: "active", label: "Ativas" },
];

export function PlataformaClient({
  organizations,
}: {
  organizations: PlatformOrganizationDTO[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FleetFilter>("all");
  const [exemptOverrides, setExemptOverrides] = useState<
    Record<string, boolean>
  >({});
  const [removedIds, setRemovedIds] = useState<Record<string, true>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmExempt, setConfirmExempt] = useState<ConfirmExempt | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(
    null,
  );
  const [deleteSlugInput, setDeleteSlugInput] = useState("");
  const [, startTransition] = useTransition();

  const orgs = useMemo(
    () =>
      organizations
        .filter((org) => !removedIds[org.id])
        .map((org) => ({
          ...org,
          billingExempt: exemptOverrides[org.id] ?? org.billingExempt,
        })),
    [organizations, exemptOverrides, removedIds],
  );

  const counts = useMemo(() => {
    let exempt = 0;
    let trial = 0;
    let noBilling = 0;
    let active = 0;
    for (const org of orgs) {
      if (org.billingExempt) exempt += 1;
      else if (org.billingStatus === BillingStatus.TRIALING) trial += 1;
      else if (!org.billingStatus) noBilling += 1;
      else if (org.billingStatus === BillingStatus.ACTIVE) active += 1;
    }
    return {
      total: orgs.length,
      exempt,
      trial,
      noBilling,
      active,
    };
  }, [orgs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((org) => {
      if (!matchesFilter(org, filter)) return false;
      if (!q) return true;
      return (
        org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q)
      );
    });
  }, [orgs, filter, query]);

  function requestExemptChange(
    org: PlatformOrganizationDTO,
    nextExempt: boolean,
  ) {
    if (nextExempt === org.billingExempt) return;
    setConfirmExempt({ org, nextExempt });
  }

  function applyExemptChange() {
    if (!confirmExempt) return;
    const { org, nextExempt } = confirmExempt;
    setConfirmExempt(null);
    setPendingId(org.id);
    startTransition(async () => {
      const result = await setOrganizationBillingExemptAction({
        organizationId: org.id,
        billingExempt: nextExempt,
      });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setExemptOverrides((prev) => ({ ...prev, [org.id]: nextExempt }));
      toast.success(
        nextExempt
          ? "Clínica isenta de faturação (acesso completo)."
          : "Isenção removida — volta a aplicar a faturação.",
      );
    });
  }

  function openDelete(org: PlatformOrganizationDTO) {
    setDeleteSlugInput("");
    setConfirmDelete({ org });
  }

  function applyDelete() {
    if (!confirmDelete) return;
    const { org } = confirmDelete;
    if (deleteSlugInput.trim() !== org.slug) {
      toast.error("Digite o slug exacto para confirmar.");
      return;
    }
    setConfirmDelete(null);
    setPendingId(org.id);
    startTransition(async () => {
      const result = await deletePlatformOrganizationAction({
        organizationId: org.id,
        confirmSlug: org.slug,
      });
      setPendingId(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setRemovedIds((prev) => ({ ...prev, [org.id]: true }));
      toast.success(`Clínica «${org.name}» excluída.`);
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
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm font-medium">Consola interna Movi</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {counts.total} clínicas · {counts.exempt} isentas · {counts.trial} em
          teste · {counts.noBilling} sem faturação · {counts.active} ativas
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou slug…"
            className="pl-9"
            aria-label="Buscar clínicas"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={filter === item.id ? "secondary" : "outline"}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {orgs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Não há clínicas para mostrar.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma clínica corresponde à busca ou ao filtro.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((org) => {
            const busy = pendingId === org.id;
            return (
              <li
                key={org.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
                  busy && "opacity-70",
                )}
                aria-busy={busy}
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="truncate font-medium">{org.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {org.slug}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="w-fit">
                      {billingBadge(org)}
                    </Badge>
                    {busy ? <Spinner className="size-3.5" /> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criada em {formatIsoDate(org.createdAt)}
                    {org.trialEndsAt
                      ? ` · Teste até ${formatIsoDate(org.trialEndsAt)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Isentar faturação
                    </span>
                    <Switch
                      checked={org.billingExempt}
                      disabled={busy}
                      onCheckedChange={(checked) =>
                        requestExemptChange(org, checked)
                      }
                      aria-label={`Isentar faturação de ${org.name}`}
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={busy}
                    onClick={() => openDelete(org)}
                  >
                    <Trash2 data-icon="inline-start" />
                    Excluir
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog
        open={confirmExempt != null}
        onOpenChange={(open) => {
          if (!open) setConfirmExempt(null);
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmExempt?.nextExempt
                ? "Isentar faturação?"
                : "Remover isenção?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmExempt?.nextExempt
                ? `«${confirmExempt.org.name}» passa a ter acesso completo sem cobrança. O Stripe, se existir, fica ignorado enquanto a isenção estiver activa.`
                : `«${confirmExempt?.org.name}» volta a seguir o billing Stripe (plano, trial ou restrições).`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={confirmExempt?.nextExempt ? "default" : "destructive"}
              onClick={applyExemptChange}
            >
              {confirmExempt?.nextExempt ? "Isentar" : "Remover isenção"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDelete != null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmDelete(null);
            setDeleteSlugInput("");
          }
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto remove permanentemente «{confirmDelete?.org.name}», membros,
              pacientes, agenda, caixa e faturação. Não dá para desfazer. Para
              confirmar, digite o slug{" "}
              <span className="font-mono font-medium text-foreground">
                {confirmDelete?.org.slug}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteSlugInput}
            onChange={(e) => setDeleteSlugInput(e.target.value)}
            placeholder="Slug da clínica"
            aria-label="Confirmar slug da clínica"
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={
                !confirmDelete ||
                deleteSlugInput.trim() !== confirmDelete.org.slug
              }
              onClick={applyDelete}
            >
              Excluir clínica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
