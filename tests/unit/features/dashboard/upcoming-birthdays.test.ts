import { buildUpcomingBirthdays } from "@/domains/dashboard/_lib/upcoming-birthdays";
import { describe, expect, it } from "vitest";

function birth(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d));
}

describe("buildUpcomingBirthdays", () => {
  it("inclui aniversário de hoje e ordena pela próxima data", () => {
    const list = buildUpcomingBirthdays(
      [
        { id: "a", name: "Ana", birthDate: birth(2010, 9, 5) },
        { id: "b", name: "Bia", birthDate: birth(2012, 9, 10) },
        { id: "c", name: "Cris", birthDate: birth(2011, 8, 1) },
      ],
      "2026-09-05",
      30,
    );

    expect(list.map((x) => x.patientId)).toEqual(["a", "b"]);
    expect(list[0]?.turningAge).toBe(16);
    expect(list[0]?.dayMonthLabel).toBe("05/09");
  });

  it("atravessa o ano novo dentro da janela", () => {
    const list = buildUpcomingBirthdays(
      [{ id: "d", name: "Dani", birthDate: birth(2015, 1, 3) }],
      "2026-12-20",
      30,
    );
    expect(list).toHaveLength(1);
    expect(list[0]?.nextDate).toBe("2027-01-03");
    expect(list[0]?.turningAge).toBe(12);
  });

  it("ignora quem já passou fora da janela", () => {
    const list = buildUpcomingBirthdays(
      [{ id: "e", name: "Eva", birthDate: birth(2010, 1, 1) }],
      "2026-09-05",
      30,
    );
    expect(list).toHaveLength(0);
  });
});
