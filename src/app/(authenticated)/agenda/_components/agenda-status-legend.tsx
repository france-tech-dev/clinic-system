import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_WITH_EVOLUTION_COLOR,
} from "@/shared/constants/appointment";

const LEGEND = [
  ...APPOINTMENT_STATUSES.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.color,
  })),
  {
    id: "evolution",
    label: "Com evolução",
    color: APPOINTMENT_WITH_EVOLUTION_COLOR,
  },
] as const;

export function AgendaStatusLegend() {
  return (
    <ul
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground"
      aria-label="Legenda de status"
    >
      {LEGEND.map((item) => (
        <li key={item.id} className="inline-flex items-center gap-1.5">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: item.color }}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
