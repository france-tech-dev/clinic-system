"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProtocolEvaluationComparisonDTO } from "@/features/protocol/protocol.types";

function shortDomainTitle(title: string) {
  if (title.length <= 18) return title;
  return `${title.slice(0, 16)}…`;
}

export function GmfmComparisonChart({
  comparison,
}: {
  comparison: ProtocolEvaluationComparisonDTO;
}) {
  const data = comparison.domainDeltas.map((d) => ({
    domain: d.domainId,
    label: shortDomainTitle(d.title),
    [comparison.baseline.label]: Math.round(d.baselinePercent * 10) / 10,
    [comparison.followUp.label]: Math.round(d.followUpPercent * 10) / 10,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar
            dataKey={comparison.baseline.label}
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey={comparison.followUp.label}
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
