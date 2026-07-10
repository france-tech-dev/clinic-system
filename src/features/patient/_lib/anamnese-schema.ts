export type AnamneseFieldType =
  | "text"
  | "textarea"
  | "check"
  | "radio"
  | "select"
  | "rating-grid"
  | "status-table";

export type AnamneseField = {
  id: string;
  label: string;
  type: AnamneseFieldType;
  w?: string;
  placeholder?: string;
  options?: string[];
  items?: string[];
  rows?: number | string[];
  hint?: string;
};

export type AnamneseSection = {
  id: string;
  title: string;
  hint?: string;
  fields: AnamneseField[];
};

export const ANAMNESE_SCHEMA: AnamneseSection[] = [
  {
    "id": "s01",
    "title": "Identificação",
    "fields": [
      {
        "id": "nomeCrianca",
        "label": "Nome da criança",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "dataNascimento",
        "label": "Data de nascimento",
        "type": "text",
        "w": "sm",
        "placeholder": "__/__/____"
      },
      {
        "id": "idade",
        "label": "Idade",
        "type": "text",
        "w": "sm"
      },
      {
        "id": "responsavel",
        "label": "Responsável",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "parentesco",
        "label": "Parentesco",
        "type": "text"
      },
      {
        "id": "telefone",
        "label": "Telefone",
        "type": "text",
        "w": "sm"
      },
      {
        "id": "escola",
        "label": "Escola",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "serieAno",
        "label": "Série/Ano",
        "type": "text"
      },
      {
        "id": "diagnosticos",
        "label": "Diagnóstico(s)",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "profissionaisAcompanham",
        "label": "Profissionais que acompanham",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "contatoEmergencia",
        "label": "Contato de emergência (nome e telefone)",
        "type": "text",
        "w": "lg"
      }
    ]
  },
  {
    "id": "s02",
    "title": "Motivo da consulta e expectativas",
    "fields": [
      {
        "id": "queixaMotivou",
        "label": "O que motivou a busca pela Terapia Ocupacional?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "queixaDificuldades",
        "label": "Quais são as maiores dificuldades no dia a dia atualmente?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "queixaDesejo",
        "label": "O que a família gostaria que a criança conseguisse fazer sozinha?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "objetivos6meses",
        "label": "Expectativas para os próximos meses de acompanhamento",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "prioridades",
        "label": "Classifique de 1 a 10 a prioridade de cada área para a família",
        "type": "rating-grid",
        "items": [
          "Alimentação",
          "Banho",
          "Vestuário",
          "Escovação",
          "Uso do banheiro",
          "Sono",
          "Tarefas domésticas",
          "Segurança/noção de perigo",
          "Comportamento",
          "Socialização",
          "Comunicação",
          "Coordenação motora",
          "Participação escolar",
          "Autorregulação",
          "Sensorial"
        ]
      }
    ]
  },
  {
    "id": "s03",
    "title": "Histórico de saúde e desenvolvimento",
    "fields": [
      {
        "id": "gestacaoIntercorrencias",
        "label": "Intercorrências na gestação (uso de medicamentos, complicações)",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "tipoParto",
        "label": "Tipo de parto",
        "type": "text"
      },
      {
        "id": "pesoIdadeGestacional",
        "label": "Peso ao nascer e idade gestacional",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "utiNeonatal",
        "label": "Necessitou UTI neonatal?",
        "type": "text"
      },
      {
        "id": "marcosMotores",
        "label": "Idade em que sustentou a cabeça, sentou, engatinhou e andou (ou “ainda não”)",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "marcosLinguagem",
        "label": "Idade das primeiras palavras e frases. Houve regressão de habilidades já adquiridas?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "diagnosticosMedicos",
        "label": "Diagnósticos médicos",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "medicamentosAtuais",
        "label": "Medicamentos atuais",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "alergiasConvulsoes",
        "label": "Alergias e/ou convulsões",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "visaoAudicao",
        "label": "Já fez avaliação de visão e audição? Algum resultado alterado?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "cirurgiasInternacoes",
        "label": "Cirurgias/Internações",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "terapiasAnteriores",
        "label": "Terapias já realizadas (TO, fono, psicologia, fisioterapia, ABA...) — período e o que funcionou ou não",
        "type": "textarea",
        "rows": 4
      }
    ]
  },
  {
    "id": "s04",
    "title": "Rotina diária e atividades de vida diária",
    "hint": "o coração da anamnese — como a criança funciona no dia a dia real",
    "fields": [
      {
        "id": "diaTipico",
        "label": "Descreva um dia típico da criança, do acordar ao dormir",
        "type": "textarea",
        "rows": 6
      },
      {
        "id": "horarioSono",
        "label": "Horários de sono, acorda durante a noite, ronca ou tem sono agitado?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "alimentacaoRotina",
        "label": "Como é a alimentação: aceita variedade de texturas e alimentos, ou é seletiva?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "seletividadeAlimentar",
        "label": "Recusa grupos ou texturas específicas? Engasgos ou dificuldade para mastigar?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "avdAlimentacao",
        "label": "Independência para se alimentar",
        "type": "status-table",
        "options": [
          "Independente",
          "Supervisão",
          "Ajuda parcial",
          "Dependente"
        ],
        "rows": [
          "Alimentar-se com talheres",
          "Beber em copo/caneca",
          "Abrir embalagens simples"
        ]
      },
      {
        "id": "avdHigiene",
        "label": "Higiene pessoal",
        "type": "status-table",
        "options": [
          "Independente",
          "Supervisão",
          "Ajuda parcial",
          "Dependente"
        ],
        "rows": [
          "Escovar os dentes",
          "Lavar mãos e rosto",
          "Tomar banho",
          "Lavar e pentear o cabelo"
        ]
      },
      {
        "id": "cortesUnhaCabelo",
        "label": "Como reage a corte de unhas e de cabelo? Tolera bem, ou demonstra desconforto, choro ou resistência?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "avdVestuario",
        "label": "Vestuário",
        "type": "status-table",
        "options": [
          "Independente",
          "Supervisão",
          "Ajuda parcial",
          "Dependente"
        ],
        "rows": [
          "Vestir/despir parte de cima",
          "Vestir/despir parte de baixo",
          "Calçar sapatos/tênis",
          "Manusear fechos (botão/zíper/velcro)"
        ]
      },
      {
        "id": "avdBanheiro",
        "label": "Uso do banheiro e mobilidade",
        "type": "status-table",
        "options": [
          "Independente",
          "Supervisão",
          "Ajuda parcial",
          "Dependente"
        ],
        "rows": [
          "Uso do banheiro (higiene íntima)",
          "Controle esfincteriano diurno",
          "Controle esfincteriano noturno",
          "Subir/descer escadas"
        ]
      },
      {
        "id": "obsDesfralde",
        "label": "Observações sobre desfralde",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "tarefasDomesticas",
        "label": "Participa de tarefas domésticas simples apropriadas à idade (guardar brinquedos, ajudar a pôr a mesa, jogar lixo fora)?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "mobilidadeCasa",
        "label": "Como se movimenta em casa e na comunidade — sobe/desce escadas, anda em superfícies irregulares, entra/sai do carro sozinho?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "nocaoPerigo",
        "label": "Tem noção de perigo (trânsito, objetos cortantes, fogão, altura)?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "usoTelas",
        "label": "Tempo de tela por dia e em quais momentos (lazer, refeições, para se acalmar)?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "autonomiaGeral",
        "label": "De forma geral, como avalia a autonomia da criança nas atividades do dia a dia comparada a outras crianças da mesma idade?",
        "type": "textarea",
        "rows": 4
      }
    ]
  },
  {
    "id": "s05",
    "title": "Comunicação e interação social",
    "fields": [
      {
        "id": "comoComunica",
        "label": "Como a criança se comunica? (fala, gestos, CAA)",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "compreensao",
        "label": "Compreende instruções simples? E instruções com mais de uma etapa?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "expressaNecessidades",
        "label": "Consegue expressar necessidades e desejos?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "ecolaliaOutrosPadroes",
        "label": "Apresenta ecolalia? Costuma iniciar interações por conta própria?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "brincarPredominante",
        "label": "Tipo de brincar predominante: funcional, simbólico (faz de conta) ou repetitivo?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "interacaoColegas",
        "label": "Como interage com outras crianças — divide brinquedos, faz amizades, participa de brincadeiras em grupo, tolera ambientes agitados?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "toleraMudancaBrincadeira",
        "label": "Tolera quando modificam a brincadeira ou a rotina de um jogo?",
        "type": "textarea",
        "rows": 3
      }
    ]
  },
  {
    "id": "s06",
    "title": "Processamento sensorial — o que a família observa",
    "hint": "relatos e observações trazidos pelos familiares no dia a dia",
    "fields": [
      {
        "id": "sensTatil",
        "label": "Sistema tátil — como reage a corte de cabelo, unhas, areia, tinta, massinha e grama? E a roupas novas, etiquetas ou costuras? Tolera sujeira nas mãos ou lava as mãos excessivamente?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "sensVestibular",
        "label": "Sistema vestibular — gosta de girar, correr, pular ou balançar? Tem medo de escadas ou elevadores? Enjoa em carro? Parece perceber o perigo normalmente?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "sensProprioceptivo",
        "label": "Sistema proprioceptivo — busca apertos fortes, carregar peso ou impacto corporal? Costuma quebrar objetos, apertar muito o lápis, derrubar coisas ou buscar colisões?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "sensAuditivo",
        "label": "Sistema auditivo — existem sons que incomodam a criança?",
        "type": "textarea",
        "rows": 2
      },
      {
        "id": "sensVisual",
        "label": "Sistema visual — tem fascínio por luzes, rodas ou objetos girando?",
        "type": "textarea",
        "rows": 2
      },
      {
        "id": "sensOlfativoOral",
        "label": "Sistema olfativo/oral — costuma cheirar objetos ou mastigar roupas e brinquedos?",
        "type": "textarea",
        "rows": 2
      }
    ]
  },
  {
    "id": "s07",
    "title": "Comportamento, autorregulação e funções executivas",
    "fields": [
      {
        "id": "desencadeiaCrises",
        "label": "O que costuma desencadear crises, ou deixar a criança mais agitada/desorganizada?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "ajudaAcalmar",
        "label": "Em quais situações a criança fica mais organizada e o que ajuda a se acalmar?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "rigidezMudancas",
        "label": "Tempo para se reorganizar após uma crise, e rigidez/dificuldade com mudanças de rotina?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "funcoesExecutivas",
        "label": "Consegue esperar a vez, seguir combinados e finalizar tarefas sem se dispersar?",
        "type": "textarea",
        "rows": 3
      }
    ]
  },
  {
    "id": "s08",
    "title": "Vida escolar",
    "fields": [
      {
        "id": "adaptacoesEscolares",
        "label": "Possui mediador ou necessita de adaptações na sala?",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "desempenhoEscolar",
        "label": "Consegue permanecer sentado, como é a escrita, e quais as principais dificuldades escolares?",
        "type": "textarea",
        "rows": 4
      },
      {
        "id": "relacionamentoEscolar",
        "label": "Relacionamento com professores e colegas, participação em atividades em grupo",
        "type": "textarea",
        "rows": 3
      }
    ]
  },
  {
    "id": "s09",
    "title": "Histórico familiar",
    "fields": [
      {
        "id": "quemMora",
        "label": "Quem mora com a criança?",
        "type": "text",
        "w": "lg"
      },
      {
        "id": "possuiIrmaos",
        "label": "Possui irmãos?",
        "type": "text"
      },
      {
        "id": "historicoFamiliar",
        "label": "Há histórico familiar de TEA, TDAH, atraso de fala, dificuldades de aprendizagem, ansiedade ou depressão?",
        "type": "textarea",
        "rows": 3
      }
    ]
  },
  {
    "id": "s10",
    "title": "Observações da família",
    "fields": [
      {
        "id": "obsFamiliaImportante",
        "label": "Existe alguma informação importante que não foi perguntada?",
        "type": "textarea",
        "rows": 6
      }
    ]
  },
  {
    "id": "s11",
    "title": "Preenchimento do terapeuta",
    "hint": "observação e raciocínio clínico direto — não é entrevista com a família",
    "fields": [
      {
        "id": "sensorialSistemas",
        "label": "Processamento sensorial — marcar o que se aplica",
        "type": "status-table",
        "options": [
          "Hiper",
          "Hipo",
          "Busca",
          "Não observado"
        ],
        "rows": [
          "Tátil",
          "Vestibular",
          "Proprioceptivo",
          "Auditivo",
          "Visual",
          "Olfativo / Oral"
        ]
      },
      {
        "id": "obsSensorial",
        "label": "Observações adicionais (gatilhos específicos, texturas, sons ou situações problemáticas)",
        "type": "textarea",
        "rows": 6,
        "placeholder": "Espaço para registrar relatos trazidos pela família sobre gatilhos, texturas, sons ou situações específicas..."
      },
      {
        "id": "hipModulacao",
        "label": "Hipótese clínica — Modulação sensorial",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "hipDiscriminacao",
        "label": "Hipótese clínica — Discriminação sensorial",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "hipPraxis",
        "label": "Hipótese clínica — Práxis / planejamento motor",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "hipCoordenacao",
        "label": "Hipótese clínica — Coordenação motora (grossa e fina)",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "hipRegulacao",
        "label": "Hipótese clínica — Regulação emocional e comportamental",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "recursosFortes",
        "label": "Recursos e pontos fortes observados",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "areasImpactadas",
        "label": "Áreas ocupacionais impactadas",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "avaliacoesComplementares",
        "label": "Avaliações complementares recomendadas",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "objetivosIniciais",
        "label": "Objetivos terapêuticos iniciais",
        "type": "textarea",
        "rows": 3
      },
      {
        "id": "frequenciaSugerida",
        "label": "Frequência e duração sugeridas do atendimento",
        "type": "text",
        "w": "lg",
        "placeholder": "Ex: 2x/semana, 50 min"
      }
    ]
  }
];
