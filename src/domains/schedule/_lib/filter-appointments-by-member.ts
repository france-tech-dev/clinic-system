/** Normaliza filtro: `"all"` / vazio / undefined → sem filtro; string → um id; array → vários. */
export function normalizeFilterIds(
  raw: string | readonly string[] | null | undefined,
): string[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    const id = raw.trim();
    if (!id || id === "all") return [];
    return [id];
  }
  return raw.map((id) => id.trim()).filter((id) => id && id !== "all");
}

function filterByIds<T>(
  items: T[],
  getId: (item: T) => string,
  raw: string | readonly string[] | null | undefined,
): T[] {
  const ids = normalizeFilterIds(raw);
  if (ids.length === 0) return items;
  const set = new Set(ids);
  return items.filter((item) => set.has(getId(item)));
}

/** Filtra agendamentos/eventos por memberId. Sem ids = todos. */
export function filterAppointmentsByMemberId<T extends { memberId: string }>(
  items: T[],
  memberId: string | readonly string[] | null | undefined,
): T[] {
  return filterByIds(items, (item) => item.memberId, memberId);
}

/** Filtra agendamentos/eventos por patientId. Sem ids = todos. */
export function filterAppointmentsByPatientId<T extends { patientId: string }>(
  items: T[],
  patientId: string | readonly string[] | null | undefined,
): T[] {
  return filterByIds(items, (item) => item.patientId, patientId);
}
