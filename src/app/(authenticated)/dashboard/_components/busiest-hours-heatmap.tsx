import type { BusiestSlots } from "@/domains/dashboard/dashboard.types";
import { BUSIEST_LOOKBACK_DAYS } from "@/domains/dashboard/_lib/build-busiest-slots";
import { cn } from "@/shared/lib/utils";
import {
  DASHBOARD_CHART_BODY,
  DashboardChartEmpty,
  DashboardChartPanel,
} from "./dashboard-chart-panel";

/** Célula do heatmap — manter headers e tracks em sincronia. */
const CELL = "size-6";
const CELL_TRACK = "1.5rem"; // = size-6
const HOUR_TRACK = "2rem";

function cellOpacity(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  return 0.18 + (count / max) * 0.82;
}

export function BusiestHoursHeatmap({ data }: { data: BusiestSlots }) {
  const hasValues = data.maxHourCount > 0;
  const dayLabels = data.weekdays.map((d) => d.shortLabel);

  return (
    <DashboardChartPanel
      className="w-fit max-w-full justify-self-start"
      title="Horários mais movimentados"
      meta={`Últimos ${BUSIEST_LOOKBACK_DAYS} dias`}
    >
      {hasValues ? (
        <div
          className={cn(
            "overflow-y-auto overflow-x-hidden",
            DASHBOARD_CHART_BODY,
            "w-fit max-w-full",
          )}
        >
          <div
            className="grid w-fit gap-1.5"
            style={{
              gridTemplateColumns: `${HOUR_TRACK} repeat(${dayLabels.length}, ${CELL_TRACK})`,
            }}
            role="table"
            aria-label="Mapa de calor de agendamentos por hora e dia da semana"
          >
            <div className="sticky top-0 z-10 size-0 bg-card" aria-hidden />
            {dayLabels.map((label, i) => (
              <div
                key={`h-${i}`}
                className={cn(
                  CELL,
                  "sticky top-0 z-10 flex items-end justify-center bg-card pb-0.5 text-center text-[10px] tabular-nums text-muted-foreground",
                )}
                role="columnheader"
              >
                {label}
              </div>
            ))}
            {data.hours.map((row) => (
              <div key={row.hour} className="contents" role="row">
                <div
                  className="flex h-6 items-center text-[10px] tabular-nums text-muted-foreground"
                  role="rowheader"
                >
                  {row.label}
                </div>
                {row.counts.map((count, weekday) => {
                  const day = data.weekdays[weekday];
                  const title = `${day?.label ?? ""} · ${row.label}: ${count}`;
                  return (
                    <div
                      key={`${row.hour}-${weekday}`}
                      role="cell"
                      title={title}
                      aria-label={title}
                      className={cn(
                        CELL,
                        "rounded-[5px]",
                        count === 0 && "bg-muted",
                      )}
                      style={
                        count > 0
                          ? {
                              backgroundColor: `color-mix(in oklab, var(--chart-1) ${Math.round(cellOpacity(count, data.maxHourCount) * 100)}%, transparent)`,
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DashboardChartEmpty>
          Ainda sem horários registados neste período.
        </DashboardChartEmpty>
      )}
    </DashboardChartPanel>
  );
}
