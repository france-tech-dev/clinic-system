const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBrl(amount: number): string {
  return brlFormatter.format(amount);
}

/** Converte "150,00" ou "150.50" para reais. */
export function parseBrl(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100) / 100;
}

export function amountToBrlInput(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}
