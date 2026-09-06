"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { CashflowSummaryCards } from "@/features/finance/components/cashflow-summary-cards";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
import { CashPeriodFilter } from "@/features/finance/components/cash-period-filter";
import { cashPeriodToSearchParams } from "@/domains/finance/_lib/period-utils";
import type {
  CashflowPageData,
  CashMemberOption,
  CashPeriod,
  CashTransactionDTO,
} from "@/domains/finance/finance.types";
import type { PatientDTO } from "@/domains/patient/patient.types";
import {
  cashPaymentMethodLabel,
  cashTransactionStatusLabel,
  cashTransactionTypeLabel,
} from "@/shared/constants/cash";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { formatBrl } from "@/shared/lib/money-utils";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityCombobox } from "@/components/entity-combobox";
import { Spinner } from "@/components/ui/spinner";
import {
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";

const MEMBER_FILTER_ALL = "all";

export function CaixaClient({
  error,
  initial,
  patients,
  members,
  memberFilter,
}: {
  error: string | null;
  initial: CashflowPageData | null;
  patients: PatientDTO[];
  members: CashMemberOption[];
  memberFilter: string;
}) {
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!initial) return null;

  return (
    <CaixaClientBody
      initial={initial}
      patients={patients}
      members={members}
      memberFilter={memberFilter}
    />
  );
}

function CaixaClientBody({
  initial,
  patients,
  members,
  memberFilter,
}: {
  initial: CashflowPageData;
  patients: PatientDTO[];
  members: CashMemberOption[];
  memberFilter: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CashTransactionDTO | null>(null);
  const [defaultType, setDefaultType] = useState<CashTransactionType>(
    CashTransactionType.INCOME,
  );
  const [pending, startTransition] = useTransition();
  const [navPending, startNavTransition] = useTransition();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filterMemberName = useMemo(() => {
    if (memberFilter === MEMBER_FILTER_ALL) return null;
    return members.find((m) => m.id === memberFilter)?.name ?? null;
  }, [memberFilter, members]);

  function buildUrl(period: CashPeriod, member: string) {
    return `${paths.caixa}?${cashPeriodToSearchParams(period, {
      member: member !== MEMBER_FILTER_ALL ? member : undefined,
    })}`;
  }

  function navigatePeriod(next: CashPeriod) {
    startNavTransition(() => {
      router.push(buildUrl(next, memberFilter));
    });
  }

  function changeMemberFilter(next: string) {
    startNavTransition(() => {
      router.push(buildUrl(initial.period, next || MEMBER_FILTER_ALL));
    });
  }

  function openCreate(type: CashTransactionType) {
    setEditing(null);
    setDefaultType(type);
    setDialogOpen(true);
  }

  function openEdit(tx: CashTransactionDTO) {
    setEditing(tx);
    setDialogOpen(true);
  }

  function handleSaved() {
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 transition-opacity",
        navPending && "pointer-events-none opacity-60",
      )}
      aria-busy={navPending}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Conferência · {initial.period.label}
            {filterMemberName ? ` · ${filterMemberName}` : " · Toda a clínica"}
          </span>
          {navPending ? (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="size-3.5" />A carregar…
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CashPeriodFilter
            period={initial.period}
            onPeriodChange={navigatePeriod}
            pending={navPending}
            trailing={
              members.length > 0 ? (
                <EntityCombobox
                  options={members}
                  value={memberFilter}
                  onValueChange={changeMemberFilter}
                  placeholder="Profissional"
                  emptyText="Nenhum profissional encontrado"
                  extraOption={{
                    id: MEMBER_FILTER_ALL,
                    name: "Todos os profissionais",
                  }}
                  className="w-56"
                  aria-label="Filtrar por profissional"
                  disabled={navPending}
                />
              ) : null
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={navPending}
              onClick={() => openCreate(CashTransactionType.EXPENSE)}
            >
              <Plus data-icon="inline-start" />
              Saída
            </Button>
            <Button
              size="sm"
              disabled={navPending}
              onClick={() => openCreate(CashTransactionType.INCOME)}
            >
              <Plus data-icon="inline-start" />
              Entrada
            </Button>
          </div>
        </div>
      </div>

      <CashflowSummaryCards
        summary={initial.summary}
        periodLabel={initial.period.label}
        variant="hero"
      />

      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Lançamentos do período</p>
        </div>

        {initial.transactions.length === 0 ? (
          <div className="space-y-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum lançamento neste período
              {filterMemberName ? ` para ${filterMemberName}` : ""}.
            </p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Registe uma entrada ou saída aqui. Na Agenda, ao marcar uma sessão
              como Realizado, a liderança também pode lançar o valor no caixa.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openCreate(CashTransactionType.EXPENSE)}
              >
                <Plus data-icon="inline-start" />
                Saída
              </Button>
              <Button size="sm" onClick={() => openCreate(CashTransactionType.INCOME)}>
                <Plus data-icon="inline-start" />
                Entrada
              </Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {initial.transactions.map((tx) => (
              <li key={tx.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  onClick={() => openEdit(tx)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          tx.type === CashTransactionType.INCOME
                            ? "border-emerald-700/30 text-emerald-800 dark:text-emerald-400"
                            : "border-destructive/30 text-destructive",
                        )}
                      >
                        {cashTransactionTypeLabel(tx.type)}
                      </Badge>
                      {tx.status === CashTransactionStatus.FORECAST ? (
                        <Badge variant="secondary">
                          {cashTransactionStatusLabel(tx.status)}
                        </Badge>
                      ) : null}
                      <span className="font-medium">{tx.description}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDateBR(tx.date)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cashPaymentMethodLabel(tx.paymentMethod)}
                      {tx.professionalName ? ` · ${tx.professionalName}` : ""}
                      {tx.patientName ? ` · ${tx.patientName}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-medium tabular-nums",
                      tx.status === CashTransactionStatus.FORECAST &&
                        "opacity-70",
                      tx.type === CashTransactionType.INCOME
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    <span className="sr-only">
                      {tx.type === CashTransactionType.INCOME ? "Entrada " : "Saída "}
                    </span>
                    {tx.type === CashTransactionType.INCOME ? "+" : "−"}
                    {formatBrl(tx.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialogOpen && (
        <CashTransactionFormDialog
          key={editing?.id ?? `new-${defaultType}`}
          open
          onOpenChange={setDialogOpen}
          patients={patients}
          members={members}
          initial={editing}
          defaultDate={today}
          defaultType={defaultType}
          lockType={!editing}
          defaultMemberId={
            memberFilter !== MEMBER_FILTER_ALL ? memberFilter : undefined
          }
          pending={pending}
          startTransition={startTransition}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
