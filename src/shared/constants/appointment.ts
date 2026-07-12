export const APPOINTMENT_STATUSES = [
  { id: "agendado", label: "Agendado", color: "#285C52" },
  { id: "realizado", label: "Realizado", color: "#5C7A3E" },
  { id: "faltou", label: "Faltou", color: "#A65D53" },
  { id: "cancelado", label: "Cancelado", color: "#726C5E" },
] as const;

/** Agendamento com evolução registrada (SessionNote compareceu na data). */
export const APPOINTMENT_WITH_EVOLUTION_COLOR = "#3D6B8C";

export type AppointmentStatusId = (typeof APPOINTMENT_STATUSES)[number]["id"];

export function appointmentStatusInfo(status: string) {
  return (
    APPOINTMENT_STATUSES.find((s) => s.id === status) ?? APPOINTMENT_STATUSES[0]
  );
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function relativeDayLabel(iso: string) {
  const today = todayIso();
  if (iso === today) return "Hoje";
  if (iso === addDaysIso(today, 1)) return "Amanhã";
  if (iso === addDaysIso(today, -1)) return "Ontem";
  const [y, m, d] = iso.split("-");
  const date = new Date(`${iso}T12:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${weekday}, ${d}/${m}/${y}`;
}

export function formatTime(time: string) {
  return time || "—";
}
