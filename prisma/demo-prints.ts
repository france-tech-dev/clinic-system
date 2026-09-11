import {
  buildDemoAnamneseData,
  buildDemoClinicalEvaluation,
} from "./demo-patient";

export const DEMO_PRINTS_MARKER = "seed:demo-prints";
export const DEMO_PRINTS_PASSWORD = "DemoMovi2026!";

export const DEMO_PRINTS_PROFESSIONALS = [
  {
    email: "fisio.demo@example.com",
    name: "Mariana Teixeira",
    profession: "fisioterapeuta" as const,
    registration: "CREFITO-3 123456-F",
    phone: "(11) 97777-1100",
  },
  {
    email: "fono.demo@example.com",
    name: "Rafael Mendes",
    profession: "fonoaudiologo" as const,
    registration: "CRFa 2-12345",
    phone: "(11) 97777-2200",
  },
];

export type DemoPrintsPatientId =
  | "helena"
  | "joao"
  | "lara"
  | "theo"
  | "beatriz"
  | "davi"
  | "sofia"
  | "enzo"
  | "valentina";

export type DemoPrintsPatientDef = {
  id: DemoPrintsPatientId;
  name: string;
  sex: "FEMALE" | "MALE";
  status: "ACTIVE" | "PAUSED" | "DISCHARGED";
  pricingType: "SESSION" | "PACKAGE";
  price: number;
  notes: string;
  /** Anos de idade aproximados; o dia do aniversário é deslocado a partir de hoje. */
  ageYears: number;
  birthdayInDays: number;
  guardian: {
    name: string;
    phone: string;
    email: string;
    insurance: string;
  };
  profession: "owner" | "fisioterapeuta" | "fonoaudiologo";
  withEvaluation: boolean;
  withAnamnese: boolean;
  evaluationDaysAgo: number | null;
};

export const DEMO_PRINTS_PATIENTS: DemoPrintsPatientDef[] = [
  {
    id: "helena",
    name: "Helena Costa",
    sex: "FEMALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 160,
    notes: "TEA nível 1. Foco em AVDs e regulação sensorial na escola.",
    ageYears: 6,
    birthdayInDays: 4,
    guardian: {
      name: "Patrícia Costa",
      phone: "(11) 99111-0101",
      email: "patricia.costa.demo@example.com",
      insurance: "particular",
    },
    profession: "owner",
    withEvaluation: true,
    withAnamnese: true,
    evaluationDaysAgo: 18,
  },
  {
    id: "joao",
    name: "João Pedro Alves",
    sex: "MALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 150,
    notes:
      "Encaminhado pela escola. Ainda sem avaliação inicial no prontuário.",
    ageYears: 8,
    birthdayInDays: 11,
    guardian: {
      name: "Fernanda Alves",
      phone: "(11) 99111-0202",
      email: "fernanda.alves.demo@example.com",
      insurance: "unimed",
    },
    profession: "owner",
    withEvaluation: false,
    withAnamnese: false,
    evaluationDaysAgo: null,
  },
  {
    id: "lara",
    name: "Lara Nunes",
    sex: "FEMALE",
    status: "PAUSED",
    pricingType: "SESSION",
    price: 150,
    notes: "Pausa por viagem da família. Retorno previsto no próximo mês.",
    ageYears: 5,
    birthdayInDays: 22,
    guardian: {
      name: "Bruno Nunes",
      phone: "(11) 99111-0303",
      email: "bruno.nunes.demo@example.com",
      insurance: "particular",
    },
    profession: "owner",
    withEvaluation: true,
    withAnamnese: true,
    evaluationDaysAgo: 40,
  },
  {
    id: "theo",
    name: "Theo Martins",
    sex: "MALE",
    status: "DISCHARGED",
    pricingType: "SESSION",
    price: 150,
    notes: "Alta recente. Objetivos de coordenação fina atingidos.",
    ageYears: 7,
    birthdayInDays: 28,
    guardian: {
      name: "Camila Martins",
      phone: "(11) 99111-0404",
      email: "camila.martins.demo@example.com",
      insurance: "sulamerica",
    },
    profession: "owner",
    withEvaluation: true,
    withAnamnese: false,
    evaluationDaysAgo: 110,
  },
  {
    id: "beatriz",
    name: "Beatriz Rocha",
    sex: "FEMALE",
    status: "ACTIVE",
    pricingType: "PACKAGE",
    price: 720,
    notes: "Pacote mensal de TO. Trabalho de escrita e organização escolar.",
    ageYears: 9,
    birthdayInDays: 16,
    guardian: {
      name: "Luciana Rocha",
      phone: "(11) 99111-0505",
      email: "luciana.rocha.demo@example.com",
      insurance: "particular",
    },
    profession: "owner",
    withEvaluation: true,
    withAnamnese: true,
    evaluationDaysAgo: 12,
  },
  {
    id: "davi",
    name: "Davi Ferreira",
    sex: "MALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 150,
    notes: "Sessões semanais. Boa adesão da família às orientações de casa.",
    ageYears: 4,
    birthdayInDays: 7,
    guardian: {
      name: "Renata Ferreira",
      phone: "(11) 99111-0606",
      email: "renata.ferreira.demo@example.com",
      insurance: "particular",
    },
    profession: "owner",
    withEvaluation: true,
    withAnamnese: false,
    evaluationDaysAgo: 25,
  },
  {
    id: "sofia",
    name: "Sofia Lima",
    sex: "FEMALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 170,
    notes: "Fisioterapia. Marcha independente em consolidação; GMFCS II.",
    ageYears: 5,
    birthdayInDays: 2,
    guardian: {
      name: "André Lima",
      phone: "(11) 99111-0707",
      email: "andre.lima.demo@example.com",
      insurance: "amil",
    },
    profession: "fisioterapeuta",
    withEvaluation: true,
    withAnamnese: false,
    evaluationDaysAgo: 9,
  },
  {
    id: "enzo",
    name: "Enzo Barbosa",
    sex: "MALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 160,
    notes: "Fisioterapia. Equilíbrio e coordenação motora grossa.",
    ageYears: 6,
    birthdayInDays: 19,
    guardian: {
      name: "Juliana Barbosa",
      phone: "(11) 99111-0808",
      email: "juliana.barbosa.demo@example.com",
      insurance: "particular",
    },
    profession: "fisioterapeuta",
    withEvaluation: false,
    withAnamnese: false,
    evaluationDaysAgo: null,
  },
  {
    id: "valentina",
    name: "Valentina Dias",
    sex: "FEMALE",
    status: "ACTIVE",
    pricingType: "SESSION",
    price: 155,
    notes: "Fonoaudiologia. Linguagem expressiva e pragmática em grupo.",
    ageYears: 4,
    birthdayInDays: 14,
    guardian: {
      name: "Carla Dias",
      phone: "(11) 99111-0909",
      email: "carla.dias.demo@example.com",
      insurance: "particular",
    },
    profession: "fonoaudiologo",
    withEvaluation: true,
    withAnamnese: false,
    evaluationDaysAgo: 6,
  },
];

export function demoPrintsMarker(id: DemoPrintsPatientId): string {
  return `${DEMO_PRINTS_MARKER}:${id}`;
}

export function birthDateForSeed(
  ageYears: number,
  birthdayInDays: number,
): Date {
  const base = new Date();
  base.setDate(base.getDate() + birthdayInDays);
  return new Date(
    Date.UTC(base.getFullYear() - ageYears, base.getMonth(), base.getDate()),
  );
}

export function offsetIsoDate(base: Date, days: number): string {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildPrintsClinicalEvaluation(
  patientName: string,
  daysAgo: number,
  baseDate: Date,
) {
  const template = buildDemoClinicalEvaluation(baseDate);
  return {
    ...template,
    date: offsetIsoDate(baseDate, -daysAgo),
    complaint: template.complaint.replace(
      "Miguel",
      patientName.split(" ")[0] ?? patientName,
    ),
  };
}

export function buildPrintsAnamnese(patientName: string, guardianName: string) {
  return {
    ...buildDemoAnamneseData(),
    childName: patientName,
    guardianName,
  };
}

export const DEMO_PRINTS_SESSION_ACTIVITIES = [
  {
    activities:
      "Circuito motor com cones; treino de sentar-levantar; brincadeira de encaixe.",
    observations:
      "Boa colaboração após aquecimento. Precisou de uma pausa no meio da sessão.",
  },
  {
    activities:
      "Atividade de recorte e colagem; sequência visual da rotina; jogo de turnos.",
    observations:
      "Completou a sequência com duas pistas verbais. Família relatou avanço em casa.",
  },
  {
    activities:
      "Marcha em superfície irregular; alongamento de ísquios; bola terapêutica.",
    observations: "Marcha mais simétrica. Fadiga no final dos 40 minutos.",
  },
];
