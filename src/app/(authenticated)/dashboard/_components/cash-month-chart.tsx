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
import type { CashDayPoint } from "@/domains/dashboard/dashboard.types";
import { formatBrl } from "@/shared/lib/money-utils";
import {
  DASHBOARD_CHART_BODY,
  DashboardChartEmpty,
  DashboardChartPanel,
} from "./dashboard-chart-panel";

const chartConfig = {
  income: { label: "Entradas", color: "var(--chart-2)" },
  forecastIncome: {
    label: "Previstas",
    color: "color-mix(in oklab, var(--chart-2) 45%, transparent)",
  },
  expense: { label: "Saídas", color: "var(--chart-5)" },
  forecastExpense: {
    label: "Previstas",
    color: "color-mix(in oklab, var(--chart-5) 45%, transparent)",
  },
} satisfies ChartConfig;

export function CashMonthChart({
  data,
  periodLabel,
}: {
  data: CashDayPoint[];
  periodLabel: string;
}) {
  const hasValues = data.some(
    (d) =>
      d.income > 0 ||
      d.expense > 0 ||
      d.forecastIncome > 0 ||
      d.forecastExpense > 0,
  );

  return (
    <DashboardChartPanel title="Fluxo de caixa" meta={periodLabel}>
      {hasValues ? (
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto ${DASHBOARD_CHART_BODY}`}
        >
          <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tickMargin={4}
              className="text-[10px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(value) =>
                Number(value) >= 1000
                  ? `${Math.round(Number(value) / 1000)}k`
                  : String(value)
              }
              className="text-[10px]"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatBrl(Number(value))}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent className="pt-1 text-[10px]" />}
            />
            <Bar
              dataKey="income"
              stackId="income"
              fill="var(--color-income)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="forecastIncome"
              stackId="income"
              fill="var(--color-forecastIncome)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="expense"
              stackId="expense"
              fill="var(--color-expense)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="forecastExpense"
              stackId="expense"
              fill="var(--color-forecastExpense)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <DashboardChartEmpty>
          Ainda não há lançamentos neste mês.
        </DashboardChartEmpty>
      )}
    </DashboardChartPanel>
  );
}
