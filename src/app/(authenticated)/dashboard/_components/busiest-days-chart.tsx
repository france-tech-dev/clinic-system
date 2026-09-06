"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { BusiestWeekday } from "@/domains/dashboard/dashboard.types";
import { BUSIEST_LOOKBACK_DAYS } from "@/domains/dashboard/_lib/build-busiest-slots";

const chartConfig = {
  count: { label: "Agendamentos", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BusiestDaysChart({ data }: { data: BusiestWeekday[] }) {
  const hasValues = data.some((d) => d.count > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg font-medium tracking-tight">
          Dias mais movimentados
        </h2>
        <p className="text-sm text-muted-foreground">
          Últimos {BUSIEST_LOOKBACK_DAYS} dias
        </p>
      </div>
      {hasValues ? (
        <ChartContainer config={chartConfig} className="aspect-[4/3] w-full">
          <BarChart data={data} margin={{ left: 4, right: 4, top: 20 }}>
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis hide allowDecimals={false} domain={[0, "auto"]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as
                      | BusiestWeekday
                      | undefined;
                    return row?.label ?? "";
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="count"
                position="top"
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
          Ainda sem agendamentos neste período.
        </p>
      )}
    </div>
  );
}
