"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CashPeriodFilter } from "@/features/finance/components/cash-period-filter";
import type { CashPeriod } from "@/domains/finance/finance.types";
import { cashPeriodToSearchParams } from "@/domains/finance/_lib/period-utils";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export function DashboardPeriodNav({ period }: { period: CashPeriod }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onPeriodChange(next: CashPeriod) {
    startTransition(() => {
      router.push(
        `${paths.dashboard}?${cashPeriodToSearchParams(next)}`,
      );
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 transition-opacity",
        pending && "pointer-events-none opacity-60",
      )}
      aria-busy={pending}
    >
      <CashPeriodFilter
        period={period}
        onPeriodChange={onPeriodChange}
        pending={pending}
      />
      {pending ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />A carregar…
        </span>
      ) : null}
    </div>
  );
}
