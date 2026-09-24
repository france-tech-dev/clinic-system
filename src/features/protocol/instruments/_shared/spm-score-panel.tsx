"use client";

import {
  isSpmSummary,
  SPM_BAND_LABELS,
  type SpmSummary,
} from "@/domains/protocol/instruments/terapia-ocupacional/_lib/spm/score";
import type { ProtocolOverallSummary } from "@/domains/protocol/instruments/_shared/protocol-score-summary";
import { cn } from "@/shared/lib/utils";

function bandMark(
  band: SpmSummary["scales"][number]["band"],
  target: NonNullable<SpmSummary["scales"][number]["band"]>,
) {
  return band === target ? "X" : "";
}

/** Tabela de scores SPM (raw / T / bandas). */
export function SpmScorePanel({
  summary,
  className,
}: {
  summary: ProtocolOverallSummary;
  className?: string;
}) {
  if (!isSpmSummary(summary)) return null;

  const showT = summary.hasNorms;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium">Escala</th>
              <th className="px-3 py-2 font-medium tabular-nums">Raw</th>
              {showT ? (
                <>
                  <th className="px-3 py-2 font-medium tabular-nums">T</th>
                  <th className="px-3 py-2 font-medium tabular-nums">%ile</th>
                  <th className="px-2 py-2 text-center font-medium">Típico</th>
                  <th className="px-2 py-2 text-center font-medium">
                    Alguns problemas
                  </th>
                  <th className="px-2 py-2 text-center font-medium">
                    Disfunção definida
                  </th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {summary.scales.map((row) => (
              <tr
                key={row.code}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-2">
                  <span className="font-medium tabular-nums">{row.code}</span>
                  <span className="ml-1.5 text-muted-foreground capitalize">
                    {row.title}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {row.raw}
                  <span className="text-muted-foreground">/{row.maxRaw}</span>
                </td>
                {showT ? (
                  <>
                    <td className="px-3 py-2 tabular-nums">
                      {row.tScore ?? "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {row.percentile ?? "—"}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold">
                      {bandMark(row.band, "typical")}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold">
                      {bandMark(row.band, "some_problems")}
                    </td>
                    <td className="px-2 py-2 text-center font-semibold">
                      {bandMark(row.band, "definite_dysfunction")}
                    </td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showT ? (
        <p className="text-xs text-muted-foreground">
          Bandas: {SPM_BAND_LABELS.typical}; {SPM_BAND_LABELS.some_problems};{" "}
          {SPM_BAND_LABELS.definite_dysfunction}. TAS (olfato/paladar) entra no
          TOT sem coluna T própria.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Tabela normativa ainda não disponível para este formulário — apenas
          escore bruto (com reversão SOC).
        </p>
      )}
    </div>
  );
}

export function formatProtocolHistoryLine(
  summary: ProtocolOverallSummary,
): string {
  if (isSpmSummary(summary)) {
    const tot = summary.scales.find((s) => s.code === "TOT");
    if (summary.hasNorms && tot?.tScore != null) {
      return `TOT raw ${tot.raw} · T ${tot.tScore}`;
    }
    return `bruto ${summary.totalScore}/${summary.maxScore}`;
  }
  return `bruto ${summary.totalScore}/${summary.maxScore} (${summary.percent.toFixed(1)}%)`;
}
