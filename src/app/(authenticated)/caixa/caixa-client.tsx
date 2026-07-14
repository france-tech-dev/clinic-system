"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CashflowSummaryCards } from "./_components/cashflow-summary-cards";
import { CashTransactionFormDialog } from "@/features/finance/components/cash-transaction-form-dialog";
import type {
  CashflowPageData,
  CashMemberOption,
  CashTransactionDTO,
} from "@/features/finance/finance.types";
import { shiftMonthParam } from "@/features/finance/_lib/month-utils";
import type { PatientDTO } from "@/features/patient/patient.types";
import {
  cashPaymentMethodLabel,
  cashTransactionTypeLabel,
} from "@/shared/constants/cash";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { formatCentsToBrl } from "@/shared/lib/money-utils";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MEMBER_FILTER_ALL = "all";

export function CaixaClient({
  initial,
  patients,
  members,
  defaultMemberId,
  memberFilter,
}: {
  initial: CashflowPageData;
  patients: PatientDTO[];
  members: CashMemberOption[];
  defaultMemberId: string;
  memberFilter: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CashTransactionDTO | null>(null);
  const [defaultType, setDefaultType] = useState<"entrada" | "saida">("entrada");
  const [pending, startTransition] = useTransition();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function buildUrl(month: string, member: string) {
    const params = new URLSearchParams();
    params.set("month", month);
    if (member && member !== MEMBER_FILTER_ALL) {
      params.set("member", member);
    }
    return `${paths.caixa}?${params.toString()}`;
  }

  function navigateMonth(delta: number) {
    const next = shiftMonthParam(initial.month, delta);
    router.push(buildUrl(next, memberFilter));
  }

  function changeMemberFilter(next: string) {
    router.push(buildUrl(initial.month, next || MEMBER_FILTER_ALL));
  }

  function openCreate(type: "entrada" | "saida") {
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(-1)}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="min-w-36 text-center font-serif text-lg font-semibold capitalize">
              {initial.monthLabel}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth(1)}
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {members.length > 0 ? (
            <Select
              value={memberFilter}
              onValueChange={(v) =>
                changeMemberFilter(v ?? MEMBER_FILTER_ALL)
              }
            >
              <SelectTrigger className="w-[200px]" size="sm">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MEMBER_FILTER_ALL}>
                  Todos os profissionais
                </SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openCreate("saida")}>
            <Plus className="size-4" />
            Saída
          </Button>
          <Button onClick={() => openCreate("entrada")}>
            <Plus className="size-4" />
            Entrada
          </Button>
        </div>
      </div>

      <CashflowSummaryCards summary={initial.summary} />

      <div className="rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Lançamentos do mês</p>
        </div>

        {initial.transactions.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento neste mês
            {memberFilter !== MEMBER_FILTER_ALL
              ? " para este profissional"
              : ""}
            . Registre entradas e saídas para acompanhar o fluxo de caixa.
          </p>
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
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium">{tx.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {cashTransactionTypeLabel(tx.type)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateBR(tx.date)} ·{" "}
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
                      tx.type === "entrada"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {tx.type === "entrada" ? "+" : "−"}
                    {formatCentsToBrl(tx.amountCents)}
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
          defaultMemberId={
            memberFilter !== MEMBER_FILTER_ALL
              ? memberFilter
              : defaultMemberId
          }
          pending={pending}
          startTransition={startTransition}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
