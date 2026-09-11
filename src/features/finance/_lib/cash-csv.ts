import type { CashTransactionDTO } from "@/domains/finance/finance.types";
import {
  cashPaymentMethodLabel,
  cashTransactionStatusLabel,
  cashTransactionTypeLabel,
} from "@/shared/constants/cash";
import {
  CashPaymentMethod,
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/** CSV dos lançamentos visíveis (UTF-8 com BOM para Excel). */
export function buildCashTransactionsCsv(
  transactions: readonly CashTransactionDTO[],
): string {
  const header = [
    "Data",
    "Tipo",
    "Estado",
    "Descrição",
    "Valor",
    "Método",
    "Profissional",
    "Paciente",
  ];

  const rows = transactions.map((tx) => [
    tx.date,
    cashTransactionTypeLabel(tx.type as CashTransactionType),
    cashTransactionStatusLabel(tx.status as CashTransactionStatus),
    tx.description,
    tx.amount.toFixed(2).replace(".", ","),
    cashPaymentMethodLabel(tx.paymentMethod as CashPaymentMethod),
    tx.professionalName ?? "",
    tx.patientName ?? "",
  ]);

  const lines = [header, ...rows].map((cols) =>
    cols.map((c) => csvEscape(String(c))).join(";"),
  );

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadCashTransactionsCsv(
  transactions: readonly CashTransactionDTO[],
  filename: string,
) {
  const csv = buildCashTransactionsCsv(transactions);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
