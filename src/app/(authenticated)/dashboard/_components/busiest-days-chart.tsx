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
import {
  DASHBOARD_CHART_BODY,
  DashboardChartEmpty,
  DashboardChartPanel,
} from "./dashboard-chart-panel";

const chartConfig = {
  count: { label: "Agendamentos", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BusiestDaysChart({ data }: { data: BusiestWeekday[] }) {
  const hasValues = data.some((d) => d.count > 0);

  return (
    <DashboardChartPanel
      title="Dias mais movimentados"
      meta={`Últimos ${BUSIEST_LOOKBACK_DAYS} dias`}
    >
      {hasValues ? (
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto ${DASHBOARD_CHART_BODY}`}
        >
          <BarChart data={data} margin={{ left: 0, right: 0, top: 18, bottom: 0 }}>
            <XAxis
              dataKey="shortLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              className="text-[10px]"
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
              radius={[3, 3, 0, 0]}
              maxBarSize={22}
            >
              <LabelList
                dataKey="count"
                position="top"
                className="fill-foreground text-[10px]"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <DashboardChartEmpty>
          Ainda sem agendamentos neste período.
        </DashboardChartEmpty>
      )}
    </DashboardChartPanel>
  );
}
