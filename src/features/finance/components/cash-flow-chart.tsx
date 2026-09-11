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
import { cn } from "@/shared/lib/utils";

const chartConfig = {
  income: { label: "Entradas", color: "var(--primary)" },
  forecastIncome: {
    label: "Entradas previstas",
    color: "color-mix(in oklab, var(--primary) 45%, transparent)",
  },
  expense: { label: "Saídas", color: "var(--destructive)" },
  forecastExpense: {
    label: "Saídas previstas",
    color: "color-mix(in oklab, var(--destructive) 45%, transparent)",
  },
} satisfies ChartConfig;

export function CashFlowChart({
  data,
  periodLabel,
  emptyMessage = "Ainda não há lançamentos neste período.",
  bodyClassName = "h-[220px] w-full",
  className,
}: {
  data: CashDayPoint[];
  periodLabel: string;
  emptyMessage?: string;
  bodyClassName?: string;
  className?: string;
}) {
  const hasValues = data.some(
    (d) =>
      d.income > 0 ||
      d.expense > 0 ||
      d.forecastIncome > 0 ||
      d.forecastExpense > 0,
  );

  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col gap-2 rounded-xl border border-border bg-card p-3",
        className,
      )}
    >
      <header className="flex min-h-10 shrink-0 flex-col justify-center gap-0.5">
        <h2 className="text-sm font-medium leading-snug tracking-tight">
          Fluxo de caixa
        </h2>
        <p className="text-[11px] leading-none text-muted-foreground">
          {periodLabel}
        </p>
      </header>

      {hasValues ? (
        <ChartContainer
          config={chartConfig}
          className={cn("aspect-auto", bodyClassName)}
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
                  formatter={(value, name, item) => {
                    const key = String(name) as keyof typeof chartConfig;
                    const seriesLabel = chartConfig[key]?.label ?? String(name);
                    const color = item.color ?? item.payload?.fill;

                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 items-center justify-between gap-6 leading-none">
                          <span className="text-muted-foreground">
                            {seriesLabel}
                          </span>
                          <span className="font-medium text-foreground tabular-nums">
                            {formatBrl(Number(value))}
                          </span>
                        </div>
                      </>
                    );
                  }}
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
        <p
          className={cn(
            "flex items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-xs text-muted-foreground",
            bodyClassName,
          )}
        >
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
