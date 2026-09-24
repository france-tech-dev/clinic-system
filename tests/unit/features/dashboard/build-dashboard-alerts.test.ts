import { buildDashboardAlerts } from "@/domains/dashboard/_lib/build-dashboard-alerts";
import { describe, expect, it } from "vitest";

describe("buildDashboardAlerts", () => {
  const now = new Date("2026-07-13T12:00:00");

  it("alerta paciente activo sem avaliação", () => {
    const alerts = buildDashboardAlerts(
      [{ id: "p1", name: "Ana", assessments: [] }],
      now,
    );

    expect(alerts).toEqual([
      {
        patientId: "p1",
        patientName: "Ana",
        kind: "sem_avaliacao",
        detail: "Sem avaliação registrada",
      },
    ]);
  });

  it("alerta reavaliação quando última avaliação ≥ 90 dias", () => {
    const alerts = buildDashboardAlerts(
      [
        {
          id: "p2",
          name: "Bruno",
          assessments: [{ date: "2026-03-01" }],
        },
      ],
      now,
    );

    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.kind).toBe("reavaliacao");
    expect(alerts[0]?.detail).toMatch(/134 dias/);
  });

  it("não alerta quando avaliação é recente", () => {
    const alerts = buildDashboardAlerts(
      [
        {
          id: "p3",
          name: "Carla",
          assessments: [{ date: "2026-07-01" }],
        },
      ],
      now,
    );

    expect(alerts).toEqual([]);
  });

  it("limita a 8 alertas", () => {
    const patients = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Paciente ${i}`,
      assessments: [] as { date: string }[],
    }));

    expect(buildDashboardAlerts(patients, now)).toHaveLength(8);
  });
});
