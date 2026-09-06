import type { BusiestSlots } from "@/domains/dashboard/dashboard.types";
import { BUSIEST_LOOKBACK_DAYS } from "@/domains/dashboard/_lib/build-busiest-slots";
import { cn } from "@/shared/lib/utils";

function cellOpacity(count: number, max: number) {
  if (count <= 0 || max <= 0) return 0;
  return 0.18 + (count / max) * 0.82;
}

export function BusiestHoursHeatmap({ data }: { data: BusiestSlots }) {
  const hasValues = data.maxHourCount > 0;
  const dayLabels = data.weekdays.map((d) => d.shortLabel);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg font-medium tracking-tight">
          Horários mais movimentados
        </h2>
        <p className="text-sm text-muted-foreground">
          Últimos {BUSIEST_LOOKBACK_DAYS} dias
        </p>
      </div>
      {hasValues ? (
        <div className="overflow-x-auto rounded-xl border border-border p-3">
          <div
            className="grid min-w-[280px] gap-1"
            style={{
              gridTemplateColumns: `2.5rem repeat(${dayLabels.length}, minmax(0, 1fr))`,
            }}
            role="table"
            aria-label="Mapa de calor de agendamentos por hora e dia da semana"
          >
            <div className="size-0" aria-hidden />
            {dayLabels.map((label, i) => (
              <div
                key={`h-${i}`}
                className="pb-1 text-center text-xs text-muted-foreground"
                role="columnheader"
              >
                {label}
              </div>
            ))}
            {data.hours.map((row) => (
              <div key={row.hour} className="contents" role="row">
                <div
                  className="flex items-center text-xs text-muted-foreground"
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
                        "aspect-square rounded-sm border border-transparent",
                        count === 0 && "bg-muted/60",
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
        <p className="rounded-xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
          Ainda sem horários registados neste período.
        </p>
      )}
    </div>
  );
}
