const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCentsToBrl(cents: number): string {
  return brlFormatter.format(cents / 100);
}

/** Converte "150,00" ou "150.50" para centavos inteiros. */
export function parseBrlToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100);
}

export function centsToBrlInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
