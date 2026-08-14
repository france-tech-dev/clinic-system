"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CashDayPoint } from "@/features/dashboard/dashboard.types";
import { formatBrl } from "@/shared/lib/money-utils";

const chartConfig = {
  income: { label: "Entradas", color: "var(--chart-2)" },
  expense: { label: "Saídas", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function CashMonthChart({
  data,
  monthLabel,
}: {
  data: CashDayPoint[];
  monthLabel: string;
}) {
  const hasValues = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg font-medium">Caixa do mês</h2>
        <p className="text-sm text-muted-foreground">{monthLabel}</p>
      </div>
      {hasValues ? (
        <ChartContainer config={chartConfig} className="aspect-video w-full">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value) =>
                Number(value) >= 1000
                  ? `${Math.round(Number(value) / 1000)}k`
                  : String(value)
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatBrl(Number(value))}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <p className="rounded-md border border-border px-3 py-8 text-center text-sm text-muted-foreground">
          Ainda não há lançamentos neste mês.
        </p>
      )}
    </div>
  );
}
