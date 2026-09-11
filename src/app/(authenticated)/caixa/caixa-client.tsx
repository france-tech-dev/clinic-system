"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { CashBalanceSidePanel } from "@/features/finance/components/cash-balance-side-panel";
import { CashFlowChart } from "@/features/finance/components/cash-flow-chart";
import { CashflowSummaryCards } from "@/features/finance/components/cashflow-summary-cards";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
import { CashPeriodFilter } from "@/features/finance/components/cash-period-filter";
import { downloadCashTransactionsCsv } from "@/features/finance/_lib/cash-csv";
import { buildCashDaySeries } from "@/domains/dashboard/_lib/build-cash-day-series";
import {
  CASH_LIST_VIEWS,
  cashListViewLabel,
  filterCashTransactionsByView,
  type CashListView,
} from "@/domains/finance/_lib/cash-list-view";
import {
  CASH_METHOD_FILTER_ALL,
  filterCashTransactionsByMethod,
  type CashMethodFilter,
} from "@/domains/finance/_lib/cash-method-filter";
import { cashPeriodToSearchParams } from "@/domains/finance/_lib/period-utils";
import { markCashTransactionPostedAction } from "@/domains/finance/finance.actions";
import type {
  CashflowPageData,
  CashMemberOption,
  CashPeriod,
  CashTransactionDTO,
} from "@/domains/finance/finance.types";
import type { PatientDTO } from "@/domains/patient/patient.types";
import {
  CASH_PAYMENT_METHODS,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  listView,
  methodFilter,
}: {
  error: string | null;
  initial: CashflowPageData | null;
  patients: PatientDTO[];
  members: CashMemberOption[];
  memberFilter: string;
  listView: CashListView;
  methodFilter: CashMethodFilter;
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
      listView={listView}
      methodFilter={methodFilter}
    />
  );
}

function CaixaClientBody({
  initial,
  patients,
  members,
  memberFilter,
  listView,
  methodFilter,
}: {
  initial: CashflowPageData;
  patients: PatientDTO[];
  members: CashMemberOption[];
  memberFilter: string;
  listView: CashListView;
  methodFilter: CashMethodFilter;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CashTransactionDTO | null>(null);
  const [defaultType, setDefaultType] = useState<CashTransactionType>(
    CashTransactionType.INCOME,
  );
  const [pending, startTransition] = useTransition();
  const [navPending, startNavTransition] = useTransition();
  const [postingId, setPostingId] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filterMemberName = useMemo(() => {
    if (memberFilter === MEMBER_FILTER_ALL) return null;
    return members.find((m) => m.id === memberFilter)?.name ?? null;
  }, [memberFilter, members]);

  const visibleTransactions = useMemo(() => {
    const byView = filterCashTransactionsByView(
      initial.transactions,
      listView,
    );
    return filterCashTransactionsByMethod(byView, methodFilter);
  }, [initial.transactions, listView, methodFilter]);

  const chartSeries = useMemo(
    () =>
      buildCashDaySeries(
        visibleTransactions,
        initial.period.start,
        initial.period.end,
      ),
    [visibleTransactions, initial.period.start, initial.period.end],
  );

  const hasActiveFilters =
    listView !== "all" || methodFilter !== CASH_METHOD_FILTER_ALL;

  function buildUrl(
    period: CashPeriod,
    member: string,
    view: CashListView = listView,
    method: CashMethodFilter = methodFilter,
  ) {
    return `${paths.caixa}?${cashPeriodToSearchParams(period, {
      member: member !== MEMBER_FILTER_ALL ? member : undefined,
      view: view !== "all" ? view : undefined,
      method: method !== CASH_METHOD_FILTER_ALL ? method : undefined,
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

  function changeListView(next: CashListView) {
    startNavTransition(() => {
      router.push(buildUrl(initial.period, memberFilter, next));
    });
  }

  function changeMethodFilter(next: CashMethodFilter) {
    startNavTransition(() => {
      router.push(buildUrl(initial.period, memberFilter, listView, next));
    });
  }

  function clearFilters() {
    startNavTransition(() => {
      router.push(
        buildUrl(
          initial.period,
          memberFilter,
          "all",
          CASH_METHOD_FILTER_ALL,
        ),
      );
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

  function handleMarkPosted(tx: CashTransactionDTO) {
    setPostingId(tx.id);
    startTransition(async () => {
      const result = await markCashTransactionPostedAction({ id: tx.id });
      setPostingId(null);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Lançamento marcado como realizado");
      router.refresh();
    });
  }

  function handleExportCsv() {
    if (visibleTransactions.length === 0) {
      toast.error("Não há lançamentos para exportar com estes filtros.");
      return;
    }
    const stamp = initial.period.start.slice(0, 7);
    downloadCashTransactionsCsv(
      visibleTransactions,
      `caixa-${stamp}${listView !== "all" ? `-${listView}` : ""}.csv`,
    );
    toast.success("CSV exportado");
  }

  const listTitle = hasActiveFilters
    ? `Lançamentos · ${cashListViewLabel(listView)}${
        methodFilter !== CASH_METHOD_FILTER_ALL
          ? ` · ${cashPaymentMethodLabel(methodFilter)}`
          : ""
      }`
    : "Lançamentos do período";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 transition-opacity md:gap-5",
        navPending && "pointer-events-none opacity-60",
      )}
      aria-busy={navPending}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Visão geral · {initial.period.label}
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
              <>
                <Select
                  value={listView}
                  onValueChange={(v) => {
                    if (v) changeListView(v as CashListView);
                  }}
                  disabled={navPending}
                >
                  <SelectTrigger
                    className="w-[10.5rem]"
                    aria-label="Filtrar por tipo"
                  >
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASH_LIST_VIEWS.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={methodFilter}
                  onValueChange={(v) => {
                    if (v) changeMethodFilter(v as CashMethodFilter);
                  }}
                  disabled={navPending}
                >
                  <SelectTrigger
                    className="w-[10.5rem]"
                    aria-label="Filtrar por método"
                  >
                    <SelectValue placeholder="Método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CASH_METHOD_FILTER_ALL}>
                      Todos os métodos
                    </SelectItem>
                    {CASH_PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {members.length > 0 ? (
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
                ) : null}
              </>
            }
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={navPending || visibleTransactions.length === 0}
              onClick={handleExportCsv}
            >
              <Download data-icon="inline-start" />
              CSV
            </Button>
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
        variant="overview"
        activeView={listView}
        onViewChange={changeListView}
      />

      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <CashFlowChart
          data={chartSeries}
          periodLabel={
            hasActiveFilters
              ? `${initial.period.label} · filtrado`
              : initial.period.label
          }
          bodyClassName="h-[260px] w-full sm:h-[300px]"
          emptyMessage="Sem lançamentos para estes filtros."
        />
        <CashBalanceSidePanel
          summary={initial.summary}
          periodLabel={initial.period.label}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm font-medium">{listTitle}</p>
          {hasActiveFilters ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={navPending}
              onClick={clearFilters}
            >
              Limpar filtros
            </Button>
          ) : null}
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
              <Button
                size="sm"
                onClick={() => openCreate(CashTransactionType.INCOME)}
              >
                <Plus data-icon="inline-start" />
                Entrada
              </Button>
            </div>
          </div>
        ) : visibleTransactions.length === 0 ? (
          <div className="space-y-3 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum lançamento com estes filtros.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              Ver todos
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visibleTransactions.map((tx) => {
              const isPosting = postingId === tx.id && pending;
              return (
                <li key={tx.id}>
                  <div className="flex items-start gap-2 px-2 py-2 sm:gap-3 sm:px-4 sm:py-3">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-4 rounded-lg px-2 py-1 text-left transition-colors hover:bg-muted/40"
                      onClick={() => openEdit(tx)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              tx.type === CashTransactionType.INCOME
                                ? "border-primary/30 text-primary"
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
                          {tx.professionalName
                            ? ` · ${tx.professionalName}`
                            : ""}
                          {tx.patientName ? ` · ${tx.patientName}` : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-medium tabular-nums",
                          tx.status === CashTransactionStatus.FORECAST &&
                            "opacity-70",
                          tx.type === CashTransactionType.INCOME
                            ? "text-primary"
                            : "text-destructive",
                        )}
                      >
                        <span className="sr-only">
                          {tx.type === CashTransactionType.INCOME
                            ? "Entrada "
                            : "Saída "}
                        </span>
                        {tx.type === CashTransactionType.INCOME ? "+" : "−"}
                        {formatBrl(tx.amount)}
                      </span>
                    </button>

                    {tx.status === CashTransactionStatus.FORECAST ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-1 shrink-0"
                        disabled={pending || navPending}
                        aria-label={`Marcar ${tx.description} como realizado`}
                        onClick={() => handleMarkPosted(tx)}
                      >
                        {isPosting ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <Check data-icon="inline-start" />
                        )}
                        <span className="hidden sm:inline">Realizar</span>
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
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
