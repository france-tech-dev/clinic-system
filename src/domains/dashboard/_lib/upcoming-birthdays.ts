/**
 * Próximos aniversários a partir de datas de nascimento (UTC date-only).
 * `todayIso` = yyyy-MM-dd (ex. via `todayIso()` em appointment constants).
 */

import { addDaysIso } from "@/shared/constants/appointment";
import { formatCivilDateParam } from "@/shared/lib/civil-date-param";
import { formatDateBR } from "@/shared/lib/format-date-br";
import type { UpcomingBirthday } from "../dashboard.types";

export type BirthdaySource = {
  id: string;
  name: string;
  /** UTC date-only (Prisma birthDate). */
  birthDate: Date;
};

function mdKey(m: number, day: number) {
  return m * 40 + day;
}

function partsFromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, day: d };
}

function toIsoDay(y: number, m: number, day: number) {
  return formatCivilDateParam(new Date(Date.UTC(y, m, day)))!;
}

/**
 * Lista aniversários nos próximos `withinDays` (inclui hoje), ordenados.
 */
export function buildUpcomingBirthdays(
  patients: BirthdaySource[],
  todayIso: string,
  withinDays = 30,
  limit = 8,
): UpcomingBirthday[] {
  const today = partsFromIso(todayIso);
  const todayKey = mdKey(today.m, today.day);
  const end = partsFromIso(addDaysIso(todayIso, withinDays));
  const crossesYear = end.y > today.y;

  const out: UpcomingBirthday[] = [];

  for (const p of patients) {
    const birthIso = formatCivilDateParam(p.birthDate);
    if (!birthIso) continue;

    const b = partsFromIso(birthIso);
    const birthKey = mdKey(b.m, b.day);

    let nextY = today.y;
    if (birthKey < todayKey) {
      nextY = today.y + 1;
    }

    if (!crossesYear && nextY === today.y) {
      if (birthKey > mdKey(end.m, end.day)) continue;
    } else if (crossesYear) {
      if (nextY === today.y) {
        // ok até fim do ano
      } else if (nextY === end.y) {
        if (birthKey > mdKey(end.m, end.day)) continue;
      } else {
        continue;
      }
    } else if (nextY > today.y) {
      continue;
    }

    const nextDate = toIsoDay(nextY, b.m, b.day);
    out.push({
      patientId: p.id,
      patientName: p.name,
      nextDate,
      dayMonthLabel: formatDateBR(nextDate).slice(0, 5),
      turningAge: nextY - b.y,
    });
  }

  return out
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
    .slice(0, limit);
}
