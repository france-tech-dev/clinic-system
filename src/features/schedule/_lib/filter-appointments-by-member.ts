/** Filtra agendamentos/eventos por memberId. `null` / `"all"` / vazio = todos. */
export function filterAppointmentsByMemberId<T extends { memberId: string }>(
  items: T[],
  memberId: string | null | undefined,
): T[] {
  const id = memberId?.trim();
  if (!id || id === "all") return items;
  return items.filter((item) => item.memberId === id);
}
