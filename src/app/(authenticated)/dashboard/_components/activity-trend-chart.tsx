"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ActivityMonthPoint } from "@/domains/dashboard/dashboard.types";

const chartConfig = {
  patients: { label: "Novos pacientes", color: "var(--chart-1)" },
  sessions: { label: "Evoluções", color: "var(--chart-2)" },
  evaluations: { label: "Avaliações", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ActivityTrendChart({ data }: { data: ActivityMonthPoint[] }) {
  const hasValues = data.some(
    (d) => d.patients > 0 || d.sessions > 0 || d.evaluations > 0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg font-medium">Atividade</h2>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </div>
      {hasValues ? (
        <ChartContainer config={chartConfig} className="aspect-video w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="patients"
              stroke="var(--color-patients)"
              fill="var(--color-patients)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="var(--color-sessions)"
              fill="var(--color-sessions)"
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="evaluations"
              stroke="var(--color-evaluations)"
              fill="var(--color-evaluations)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <p className="rounded-md border border-border px-3 py-8 text-center text-sm text-muted-foreground">
          Ainda não há atividade registrada neste período.
        </p>
      )}
    </div>
  );
}
