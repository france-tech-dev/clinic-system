import { eachDayOfInterval, format, parse } from "date-fns";
import type { CashDayPoint } from "../dashboard.types";

export type CashSeriesTx = {
  date: string;
  type: string;
  amount: number;
};

export function buildCashDaySeries(
  transactions: CashSeriesTx[],
  monthParam: string,
): CashDayPoint[] {
  const start = parse(`${monthParam}-01`, "yyyy-MM-dd", new Date());
  const end = parse(
    format(
      new Date(start.getFullYear(), start.getMonth() + 1, 0),
      "yyyy-MM-dd",
    ),
    "yyyy-MM-dd",
    new Date(),
  );

  const days = eachDayOfInterval({ start, end });
  const byDate = new Map<string, { income: number; expense: number }>();

  for (const day of days) {
    byDate.set(format(day, "yyyy-MM-dd"), { income: 0, expense: 0 });
  }

  for (const tx of transactions) {
    const bucket = byDate.get(tx.date);
    if (!bucket) continue;
    if (tx.type === "income") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  return days.map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const bucket = byDate.get(date) ?? { income: 0, expense: 0 };
    return {
      date,
      label: format(day, "dd/MM"),
      income: bucket.income,
      expense: bucket.expense,
    };
  });
}
