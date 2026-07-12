"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CashflowSummaryCards } from "./_components/cashflow-summary-cards";
import { CashTransactionFormDialog } from "./_components/cash-transaction-form-dialog";
import type { CashflowPageData, CashTransactionDTO } from "@/features/finance/finance.types";
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

export function CaixaClient({
  initial,
  patients,
}: {
  initial: CashflowPageData;
  patients: PatientDTO[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CashTransactionDTO | null>(null);
  const [defaultType, setDefaultType] = useState<"entrada" | "saida">("entrada");
  const [pending, startTransition] = useTransition();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function navigateMonth(delta: number) {
    const next = shiftMonthParam(initial.month, delta);
    router.push(`${paths.caixa}?month=${next}`);
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
            Nenhum lançamento neste mês. Registre entradas e saídas para
            acompanhar o fluxo de caixa.
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
          initial={editing}
          defaultDate={today}
          defaultType={defaultType}
          pending={pending}
          startTransition={startTransition}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
