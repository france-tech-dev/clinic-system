import { CashTransactionStatus, CashTransactionType } from "@prisma/enums";
import { eachDayOfInterval, format, parse } from "date-fns";
import type { CashDayPoint } from "../dashboard.types";

export type CashSeriesTx = {
  date: string;
  type: string;
  amount: number;
  status?: string;
};

export function buildCashDaySeries(
  transactions: CashSeriesTx[],
  startDate: string,
  endDate: string,
): CashDayPoint[] {
  const start = parse(startDate, "yyyy-MM-dd", new Date());
  const end = parse(endDate, "yyyy-MM-dd", new Date());
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }
  const orderedStart = start <= end ? start : end;
  const orderedEnd = start <= end ? end : start;

  const days = eachDayOfInterval({ start: orderedStart, end: orderedEnd });
  const byDate = new Map<
    string,
    {
      income: number;
      expense: number;
      forecastIncome: number;
      forecastExpense: number;
    }
  >();

  for (const day of days) {
    byDate.set(format(day, "yyyy-MM-dd"), {
      income: 0,
      expense: 0,
      forecastIncome: 0,
      forecastExpense: 0,
    });
  }

  for (const tx of transactions) {
    const bucket = byDate.get(tx.date);
    if (!bucket) continue;
    const isIncome = tx.type === CashTransactionType.INCOME;
    const isForecast = tx.status === CashTransactionStatus.FORECAST;

    if (isForecast) {
      if (isIncome) bucket.forecastIncome += tx.amount;
      else bucket.forecastExpense += tx.amount;
      continue;
    }

    if (isIncome) bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  return days.map((day) => {
    const date = format(day, "yyyy-MM-dd");
    const bucket = byDate.get(date) ?? {
      income: 0,
      expense: 0,
      forecastIncome: 0,
      forecastExpense: 0,
    };
    return {
      date,
      label: format(day, "dd/MM"),
      ...bucket,
    };
  });
}
