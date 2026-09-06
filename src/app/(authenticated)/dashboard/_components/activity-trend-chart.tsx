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
import {
  DASHBOARD_CHART_BODY,
  DashboardChartEmpty,
  DashboardChartPanel,
} from "./dashboard-chart-panel";

const chartConfig = {
  patients: { label: "Pacientes", color: "var(--chart-1)" },
  sessions: { label: "Evoluções", color: "var(--chart-2)" },
  evaluations: { label: "Avaliações", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function ActivityTrendChart({ data }: { data: ActivityMonthPoint[] }) {
  const hasValues = data.some(
    (d) => d.patients > 0 || d.sessions > 0 || d.evaluations > 0,
  );

  return (
    <DashboardChartPanel title="Atividade" meta="Últimos 6 meses">
      {hasValues ? (
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto ${DASHBOARD_CHART_BODY}`}
        >
          <AreaChart
            data={data}
            margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              className="text-[10px]"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={24}
              className="text-[10px]"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend
              content={<ChartLegendContent className="pt-1 text-[10px]" />}
            />
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
        <DashboardChartEmpty>
          Ainda não há atividade registrada neste período.
        </DashboardChartEmpty>
      )}
    </DashboardChartPanel>
  );
}
