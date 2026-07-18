import { EVALUATION_DOMAINS } from "@/shared/constants/evaluation-domains";

type DemoEvaluationDomain = {
  categoryId: string;
  score: number;
  note: string;
};

/** Marcador interno — idempotência do seed (não exibido na UI). */
export const DEMO_PATIENT_SEED_MARKER = "seed:demo-patient-apresentacao";

export const DEMO_PATIENT_NAME = "Miguel Oliveira";

export const DEMO_PATIENT_NOTES =
  "Caso fictício para demonstração do Fichário TO. Criança de 7 anos, encaminhada para trabalhar coordenação fina, autorregulação e AVDs.";

const DOMAIN_SCORES: Record<string, { score: number; note: string }> = {
  fina: {
    score: 1,
    note: "Preensão em pinça frágil; dificuldade com recorte, colagem e traçado.",
  },
  grossa: {
    score: 2,
    note: "Equilíbrio preservado; coordenação bimanual ainda em consolidação.",
  },
  cognicao: {
    score: 2,
    note: "Boa memória visual; planejamento sequencial demanda apoio verbal.",
  },
  avd: {
    score: 1,
    note: "Dependência parcial para vestir-se e organizar materiais escolares.",
  },
  sensorial: {
    score: 1,
    note: "Hipersensibilidade tátil em roupas com etiquetas e tecidos ásperos.",
  },
  coordenacao: {
    score: 2,
    note: "Alternância de mãos irregular em tarefas de mesa.",
  },
  comunicacao: {
    score: 2,
    note: "Comunicação funcional; prefere interações curtas e previsíveis.",
  },
  participacao: {
    score: 2,
    note: "Participa em dupla; evita brincadeiras competitivas em grupo grande.",
  },
};

export function buildDemoEvaluationDomains(): DemoEvaluationDomain[] {
  return EVALUATION_DOMAINS.map((category) => {
    const entry = DOMAIN_SCORES[category.id];
    return {
      categoryId: category.id,
      score: entry?.score ?? 2,
      note: entry?.note ?? "",
    };
  });
}

export function buildDemoEvaluation(baseDate: Date) {
  const date = offsetDate(baseDate, -42);

  return {
    tipo: "Inicial",
    date: formatIsoDate(date),
    queixa:
      "Dificuldade para manter atenção em tarefas de mesa, resistência a atividades de coordenação fina e desorganização na rotina de manhã.",
    historia:
      "Encaminhado pela pediatra após relato escolar de baixa autonomia para AVDs e cansaço rápido em atividades manuais. Família relata melhora com rotina visual, mas ainda há resistência sensorial em vestuário.",
    domains: buildDemoEvaluationDomains(),
    objetivos:
      "1. Ampliar preensão em pinça e resistência em tarefas finas.\n2. Ganhar autonomia parcial em vestir-se.\n3. Tolerar estímulos táteis em materiais escolares.\n4. Organizar sequência da rotina matinal com apoio mínimo.",
    condutas:
      "Sessões semanais de 50 min com abordagem lúdica, uso de pistas visuais e graduação sensorial. Plano domiciliar com 2 atividades por semana.",
    diagnostico: "Atraso no desenvolvimento das habilidades visomotoras e AVDs",
    encaminhadoPor: "Dra. Ana Paula Mendes — Pediatria",
    contextoFamiliar:
      "Mora com os pais e irmã mais nova (4 anos). Mãe acompanha sessões quinzenalmente.",
    nivelPrevio: "Nenhum acompanhamento de TO anterior.",
    medicacoes: "Nenhuma medicação contínua.",
    precaucoes: "Evitar estímulos auditivos intensos sem aviso prévio.",
    equipamentos: "Tábua inclinada, massinha, pinça, cartões de sequência.",
    frequencia: "1x por semana",
    criteriosAlta:
      "Autonomia para vestir-se com botões médios, preensão funcional para escrita e participação estável em atividades escolares.",
  };
}

export function buildDemoAnamneseData() {
  return {
    nomeCrianca: DEMO_PATIENT_NAME,
    dataNascimento: "15/03/2019",
    idade: "7 anos",
    responsavel: "Carla Oliveira",
    parentesco: "Mãe",
    telefone: "(11) 98765-4321",
    escola: "EMEF Prof. João Silva",
    serieAno: "2º ano",
    diagnosticos: "TEA — nível 1 de suporte",
    profissionaisAcompanham: "Pediatra, fonoaudióloga",
    queixaMotivou:
      "A escola relatou dificuldade para iniciar tarefas, baixa autonomia em AVDs e resistência a atividades que envolvem coordenação fina.",
    queixaDificuldades:
      "Vestir-se sozinho, organizar materiais, participar de brincadeiras em grupo e tolerar certos tecidos.",
    queixaDesejo:
      "Que Miguel consiga se arrumar para a escola com menos ajuda e participe das atividades em sala.",
    objetivos6meses:
      "Maior autonomia nas AVDs de manhã e melhor engajamento em tarefas escolares.",
    gestacaoIntercorrencias: "Gestação sem intercorrências significativas.",
    tipoParto: "Cesárea eletiva",
    pesoIdadeGestacional: "3,1 kg — 39 semanas",
    marcosMotores:
      "Sentou aos 7 meses, engatinhou aos 10 meses, andou aos 14 meses.",
    marcosLinguagem:
      "Primeiras palavras aos 18 meses; frases curtas a partir dos 3 anos.",
    diagnosticosMedicos: "TEA — nível 1; acompanhamento multidisciplinar.",
    medicamentosAtuais: "Nenhum",
    "prioridades::Alimentação": "6",
    "prioridades::Vestuário": "9",
    "prioridades::Coordenação motora": "8",
    "prioridades::Autorregulação": "7",
    "prioridades::Sensorial": "8",
  };
}

export function buildDemoSessionNotes() {
  return [
    {
      status: "compareceu" as const,
      atividades:
        "Pinça de grãos com transferência entre potes; circuito com obstáculos baixos; rotina visual da manhã (cartões ilustrados).",
      observacoes:
        "Boa tolerância à pinça por 8 minutos. Precisou de pausa sensorial antes do circuito motor.",
    },
    {
      status: "compareceu" as const,
      atividades:
        "Treino de abotoamento em camisa adaptada; massinha com moldes; jogo da memória com 6 pares.",
      observacoes:
        "Conseguiu abotoar 2 botões grandes com mínima ajuda. Memória: 4 pares encontrados na segunda tentativa.",
    },
    {
      status: "compareceu" as const,
      atividades:
        "Caixa sensorial tátil com arroz e objetos escondidos; sequência da rotina matinal; alongamento bilateral.",
      observacoes:
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
      status: "realizado" as const,
      notes: "Sessão inicial: pinça e circuito motor.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, -14)),
      time: "09:00",
      duration: 50,
      status: "realizado" as const,
      notes: "Treino de abotoamento e memória.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, -7)),
      time: "09:00",
      duration: 50,
      status: "realizado" as const,
      notes: "Sessão com foco sensorial e rotina matinal.",
      withEvolution: true,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, 0)),
      time: "09:00",
      duration: 50,
      status: "agendado" as const,
      notes: "Continuidade: pinça + AVD vestir.",
      withEvolution: false,
    },
    {
      date: formatIsoDate(offsetDate(baseDate, 7)),
      time: "09:00",
      duration: 50,
      status: "agendado" as const,
      notes: "Reavaliação parcial de objetivos.",
      withEvolution: false,
    },
  ];
}

export function buildDemoCashTransaction(baseDate: Date) {
  return {
    type: "entrada" as const,
    amountCents: 15000,
    date: formatIsoDate(offsetDate(baseDate, -7)),
    description: "Sessão de TO — Miguel Oliveira",
    paymentMethod: "pix" as const,
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
