import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

/** Altura partilhada do corpo dos 4 painéis de tendência. */
export const DASHBOARD_CHART_BODY = "h-[220px] w-full";

export function DashboardChartPanel({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col gap-2 rounded-xl border border-border bg-card p-3",
        className,
      )}
    >
      <header className="flex min-h-10 shrink-0 flex-col justify-center gap-0.5">
        <h2 className="text-sm font-medium leading-snug tracking-tight">
          {title}
        </h2>
        {meta != null ? (
          <p className="text-[11px] leading-none text-muted-foreground">{meta}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function DashboardChartEmpty({ children }: { children: ReactNode }) {
  return (
    <p
      className={cn(
        "flex items-center justify-center rounded-lg border border-dashed border-border px-3 text-center text-xs text-muted-foreground",
        DASHBOARD_CHART_BODY,
      )}
    >
      {children}
    </p>
  );
}
