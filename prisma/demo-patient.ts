import { CLINICAL_EVALUATION_DOMAINS } from "../src/shared/constants/clinical-evaluation-domains";

type DemoClinicalEvaluationDomain = {
  categoryId: string;
  score: number;
  note: string;
};

/** Marcador interno — idempotência do seed (não exibido na UI). */
export const DEMO_PATIENT_SEED_MARKER = "seed:demo-patient-apresentacao";

export const DEMO_PATIENT_NAME = "Miguel Oliveira";

export const DEMO_PATIENT_NOTES =
  "Caso fictício para demonstração do Clinic System. Criança de 7 anos, encaminhada para trabalhar coordenação fina, autorregulação e AVDs.";

const DOMAIN_SCORES: Record<string, { score: number; note: string }> = {
  "fine-motor": {
    score: 1,
    note: "Preensão em pinça frágil; dificuldade com recorte, colagem e traçado.",
  },
  "gross-motor": {
    score: 2,
    note: "Equilíbrio preservado; coordenação bimanual ainda em consolidação.",
  },
  cognition: {
    score: 2,
    note: "Boa memória visual; planejamento sequencial demanda apoio verbal.",
  },
  adl: {
    score: 1,
    note: "Dependência parcial para vestir-se e organizar materiais escolares.",
  },
  sensory: {
    score: 1,
    note: "Hipersensibilidade tátil em roupas com etiquetas e tecidos ásperos.",
  },
  coordination: {
    score: 2,
    note: "Alternância de mãos irregular em tarefas de mesa.",
  },
  communication: {
    score: 2,
    note: "Comunicação funcional; prefere interações curtas e previsíveis.",
  },
  participation: {
    score: 2,
    note: "Participa em dupla; evita brincadeiras competitivas em grupo grande.",
  },
};

export function buildDemoClinicalEvaluationDomains(): DemoClinicalEvaluationDomain[] {
  return CLINICAL_EVALUATION_DOMAINS.map((category) => {
    const entry = DOMAIN_SCORES[category.id];
    return {
      categoryId: category.id,
      score: entry?.score ?? 2,
      note: entry?.note ?? "",
    };
  });
}

export function buildDemoClinicalEvaluation(baseDate: Date) {
  const date = offsetDate(baseDate, -42);

  return {
    type: "Initial",
    date: formatIsoDate(date),
    complaint:
      "Dificuldade para manter atenção em tarefas de mesa, resistência a atividades de coordenação fina e desorganização na rotina de manhã.",
    history:
      "Encaminhado pela pediatra após relato escolar de baixa autonomia para AVDs e cansaço rápido em atividades manuais. Família relata melhora com rotina visual, mas ainda há resistência sensorial em vestuário.",
    domains: buildDemoClinicalEvaluationDomains(),
    goals:
      "1. Ampliar preensão em pinça e resistência em tarefas finas.\n2. Ganhar autonomia parcial em vestir-se.\n3. Tolerar estímulos táteis em materiais escolares.\n4. Organizar sequência da rotina matinal com apoio mínimo.",
    interventions:
      "Sessões semanais de 50 min com abordagem lúdica, uso de pistas visuais e graduação sensorial. Plano domiciliar com 2 atividades por semana.",
    diagnosis: "Atraso no desenvolvimento das habilidades visomotoras e AVDs",
    referredBy: "Dra. Ana Paula Mendes — Pediatria",
    familyContext:
      "Mora com os pais e irmã mais nova (4 anos). Mãe acompanha sessões quinzenalmente.",
    previousLevel: "Nenhum acompanhamento de TO anterior.",
    medications: "Nenhuma medicação contínua.",
    precautions: "Evitar estímulos auditivos intensos sem aviso prévio.",
    equipment: "Tábua inclinada, massinha, pinça, cartões de sequência.",
    frequency: "1x por semana",
    dischargeCriteria:
      "Autonomia para vestir-se com botões médios, preensão funcional para escrita e participação estável em atividades escolares.",
  };
}

export function buildDemoAnamneseData() {
  return {
    childName: DEMO_PATIENT_NAME,
    birthDate: "15/03/2019",
    age: "7 anos",
    guardianName: "Carla Oliveira",
    relationship: "Mãe",
    phone: "(11) 98765-4321",
    school: "EMEF Prof. João Silva",
    gradeYear: "2º ano",
    diagnoses: "TEA — nível 1 de suporte",
    accompanyingProfessionals: "Pediatra, fonoaudióloga",
    chiefComplaintReason:
      "A escola relatou dificuldade para iniciar tarefas, baixa autonomia em AVDs e resistência a atividades que envolvem coordenação fina.",
    chiefComplaintDifficulties:
      "Vestir-se sozinho, organizar materiais, participar de brincadeiras em grupo e tolerar certos tecidos.",
    chiefComplaintDesire:
      "Que Miguel consiga se arrumar para a escola com menos ajuda e participe das atividades em sala.",
    goals6Months:
      "Maior autonomia nas AVDs de manhã e melhor engajamento em tarefas escolares.",
    pregnancyComplications: "Gestação sem intercorrências significativas.",
    deliveryType: "Cesárea eletiva",
    birthWeightGestationalAge: "3,1 kg — 39 semanas",
    motorMilestones:
      "Sentou aos 7 meses, engatinhou aos 10 meses, andou aos 14 meses.",
    languageMilestones:
      "Primeiras palavras aos 18 meses; frases curtas a partir dos 3 anos.",
    medicalDiagnoses: "TEA — nível 1; acompanhamento multidisciplinar.",
    currentMedications: "Nenhum",
    "priorities::Alimentação": "6",
    "priorities::Vestuário": "9",
    "priorities::Coordenação motora": "8",
    "priorities::Autorregulação": "7",
    "priorities::Sensorial": "8",
  };
}

export function buildDemoSessionNotes() {
  return [
    {
      status: "ATTENDED" as const,
      activities:
        "Pinça de grãos com transferência entre potes; circuito com obstáculos baixos; rotina visual da manhã (cartões ilustrados).",
      observations:
        "Boa tolerância à pinça por 8 minutos. Precisou de pausa sensorial antes do circuito motor.",
    },
    {
      status: "ATTENDED" as const,
      activities:
        "Treino de abotoamento em camisa adaptada; massinha com moldes; jogo da memória com 6 pares.",
      observations:
        "Conseguiu abotoar 2 botões grandes com mínima ajuda. Memória: 4 pares encontrados na segunda tentativa.",
    },
    {
      status: "ATTENDED" as const,
      activities:
        "Caixa sensorial tátil com arroz e objetos escondidos; sequência da rotina matinal; alongamento bilateral.",
      observations:
        "Explorou texturas por 12 minutos com regulação adequada. Família relatou melhora leve na rotina de manhã.",
    },
  ];
}

export function buildDemoAppointments(baseDate: Date) {
  return [
    {
      date: formatIsoDate(offsetDate(baseDate, -21)),
      time: "09:00",
      duration: 50,
      status: "COMPLETED" as const,
      notes: "Sessão inicial: pinça e circuito motor.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, -14)),
      time: "09:00",
      duration: 50,
      status: "COMPLETED" as const,
      notes: "Treino de abotoamento e memória.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, -7)),
      time: "09:00",
      duration: 50,
      status: "COMPLETED" as const,
      notes: "Sessão com foco sensorial e rotina matinal.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, 0)),
      time: "09:00",
      duration: 50,
      status: "SCHEDULED" as const,
      notes: "Continuidade: pinça + AVD vestir.",
      withEvolution: false,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, 7)),
      time: "09:00",
      duration: 50,
      status: "SCHEDULED" as const,
      notes: "Reavaliação parcial de objetivos.",
      withEvolution: false,
    },
  ];
}

export function buildDemoCashTransaction(baseDate: Date) {
  return {
    type: "INCOME" as const,
    amount: 150,
    date: formatIsoDate(offsetDate(baseDate, -7)),
    description: "Sessão de TO — Miguel Oliveira",
    paymentMethod: "PIX" as const,
  };
}

function offsetDate(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
