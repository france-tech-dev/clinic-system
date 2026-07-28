export type RoteiroRow = [string, string, string];

export type RoteiroCategory = {
  tick: string;
  title: string;
  context: string;
  rows: RoteiroRow[];
};

export type RoteiroId = "sensory-integration" | "fine-motor" | "feeding-selectivity";

export type Roteiro = {
  id: RoteiroId;
  label: string;
  categories: RoteiroCategory[];
};

export const SENSORY_INTEGRATION_CATEGORIES: RoteiroCategory[] = [
  {
    "tick": "vestibular",
    "title": "Sistema vestibular",
    "context": "Base para tônus postural, equilíbrio, segurança gravitacional e regulação do estado de alerta.",
    "rows": [
      [
        "Controle postural",
        "Mantém postura ereta? Quedas frequentes? Inclina o tronco?",
        "Sugere processamento vestibular-postural comprometido; risco de instabilidade e insegurança em atividades de equilíbrio."
      ],
      [
        "Tônus muscular extensor (“avião”)",
        "Sustenta cabeça e tronco contra a gravidade em prono?",
        "Hipotonia extensora sugere hiporresponsividade vestibular; dificuldade em tarefas antigravitárias."
      ],
      [
        "Segurança gravitacional",
        "Evita altura? Medo de balançar, correr ou pular?",
        "Sinal clássico de hiper-responsividade vestibular (insegurança gravitacional); tendência a evitar desafios de movimento."
      ],
      [
        "Equilíbrio dinâmico",
        "Mantém equilíbrio durante o movimento (andar, correr, mudar direção)?",
        "Dificuldade sugere processamento vestibular-proprioceptivo comprometido para ajustes posturais em tempo real."
      ],
      [
        "Equilíbrio estático — olhos fechados (instável)",
        "Perde o equilíbrio ao fechar os olhos parada?",
        "Instabilidade acentuada sugere dependência excessiva da visão, com processamento vestibular pouco confiável."
      ],
      [
        "Reações de equilíbrio",
        "Apresenta ajustes automáticos ao ser desequilibrada?",
        "Ausência ou atraso sugere integração vestibular-proprioceptiva imatura; risco de quedas."
      ],
      [
        "Reação de extensão protetiva (“pára-quedas”)",
        "Estende os braços automaticamente ao ser inclinada para frente/lado?",
        "Ausência é sinal de alerta clássico de disfunção vestibular-proprioceptiva; risco de segurança."
      ],
      [
        "Nível de excitação",
        "Prostrado/apático/quase dorme, ou agitado/girando/subindo em móveis?",
        "Extremos sugerem modulação vestibular disfuncional — hiporresponsividade ou busca vestibular."
      ],
      [
        "Controle motor ocular",
        "Acompanha objetos com os olhos? Mantém foco em movimento?",
        "Dificuldade sugere conexão vestibular-oculomotora comprometida; pode impactar leitura e esportes com bola."
      ],
      [
        "Desenvolvimento da linguagem",
        "Fala com clareza? Tem fluência verbal? Usa gestos junto à fala?",
        "Alterações associadas podem refletir a base vestibular compartilhada com áreas de planejamento motor da fala."
      ]
    ]
  },
  {
    "tick": "proprioceptive",
    "title": "Sistema proprioceptivo",
    "context": "Consciência de posição e força corporal — base da estabilidade postural, da graduação de força e do planejamento motor.",
    "rows": [
      [
        "Tônus muscular geral",
        "Hipotônico ou hipertônico? Postura encurvada ou rígida?",
        "Tônus baixo sugere processamento proprioceptivo pouco eficiente para sustentação postural."
      ],
      [
        "Nível de excitação/busca",
        "Busca constantemente estímulos físicos intensos (empurrar, se jogar, colidir)?",
        "Busca intensa sugere hiporresponsividade proprioceptiva — necessidade de input forte para registrar a própria posição corporal."
      ],
      [
        "Estabilidade articular proximal / cocontração",
        "Mantém postura estável ao sentar? Usa força excessiva ou fraca?",
        "Instabilidade sugere baixa cocontração muscular, comprometendo a base para o controle motor fino distal."
      ],
      [
        "Controle postural (sentado)",
        "Permanece sentado com estabilidade? Ajusta a postura quando necessário?",
        "Dificuldade sugere feedback proprioceptivo insuficiente para ajustes posturais automáticos."
      ],
      [
        "Cinestesia",
        "Reconhece a posição do próprio membro sem usar a visão?",
        "Erro de reconhecimento sugere discriminação proprioceptiva comprometida."
      ],
      [
        "Equilíbrio estático — olhos fechados (estável)",
        "Mantém-se estável ao fechar os olhos parada?",
        "Estabilidade mantida indica boa suplência proprioceptiva quando a visão é removida."
      ],
      [
        "Diadococinésia",
        "Executa movimentos alternados rápidos (pronação/supinação) com ritmo?",
        "Irregularidade sugere dificuldade de feedback proprioceptivo/coordenação motora fina — comum em dispraxia."
      ],
      [
        "Oponência dos dedos",
        "Toca cada dedo no polegar em sequência rápida?",
        "Lentidão ou desorganização sugere planejamento motor fino comprometido, apoiado em feedback proprioceptivo."
      ],
      [
        "Dedo no nariz",
        "Toca o próprio nariz com o dedo indicador, olhos fechados?",
        "Imprecisão sugere discriminação proprioceptiva ou controle motor comprometido."
      ],
      [
        "Braços em extensão",
        "Mantém os braços estendidos à frente, olhos fechados, sem desviar?",
        "Deriva do(s) braço(s) sugere feedback proprioceptivo instável."
      ],
      [
        "Musculatura flexora",
        "Tônus e força da musculatura flexora estão adequados?",
        "Alteração no tônus flexor, somada à extensora, compõe o quadro geral de tônus postural."
      ],
      [
        "Planejamento motor",
        "Movimentos fluidos e organizados? Adapta a ação ao ambiente?",
        "Desorganização sugere práxis comprometida, com base proprioceptiva insuficiente."
      ],
      [
        "Uso manual",
        "Segura objetos com força adequada? Ajusta a pegada conforme o objeto?",
        "Força mal graduada (aperta demais ou de menos) sugere discriminação proprioceptiva comprometida — impacta escrita e manuseio de objetos."
      ]
    ]
  },
  {
    "tick": "tactile",
    "title": "Sistema tátil",
    "context": "Discriminação e modulação do toque — base da defensividade tátil, da destreza manual e de parte da práxis.",
    "rows": [
      [
        "Reações emocionais ao toque/social",
        "Incomoda-se com toque de outras pessoas? Evita contato físico?",
        "Sugere defensividade tátil / hiper-responsividade tátil."
      ],
      [
        "Atenção focada",
        "Mantém atenção em uma tarefa ou se distrai facilmente?",
        "Distração fácil pode refletir dificuldade de filtrar estímulos táteis irrelevantes do ambiente."
      ],
      [
        "Nível de atividade",
        "Letárgico ou hiperativo? Alterna entre extremos?",
        "Extremos podem refletir modulação tátil disfuncional."
      ],
      [
        "Irritabilidade a estímulos táteis",
        "Reações emocionais intensas a roupas, texturas, toque?",
        "Sinal clássico de defensividade tátil."
      ],
      [
        "Habilidades motoras orais",
        "Mastiga com eficiência? Evita certas texturas de alimentos?",
        "Sugere processamento tátil oral comprometido, com possíveis implicações alimentares."
      ],
      [
        "Identifica o toque",
        "Localiza corretamente onde foi tocada, sem usar a visão?",
        "Erro de localização sugere discriminação tátil comprometida."
      ],
      [
        "Estereognosia",
        "Reconhece um objeto apenas pelo toque, sem ver?",
        "Dificuldade sugere discriminação tátil comprometida — essencial para tarefas manuais sem apoio visual."
      ],
      [
        "Habilidades manuais",
        "Usa as mãos com destreza? Manipula objetos pequenos com facilidade?",
        "Discriminação tátil pobre compromete a destreza fina."
      ],
      [
        "Planejamento motor manual",
        "Tem dificuldade em começar/concluir uma tarefa manual? Usa estratégias compensatórias?",
        "O sistema tátil é uma base fundamental da práxis; comprometimento tátil pode contribuir para dispraxia."
      ],
      [
        "Musculatura flexora (resposta tátil-motora)",
        "Resposta de flexão/proteção frente ao toque está adequada?",
        "Participa da resposta de proteção/aversão tátil quando alterada."
      ]
    ]
  },
  {
    "tick": "visual",
    "title": "Sistema visual",
    "context": "Percepção e controle oculomotor — sustentam cópia, leitura e integração visuo-motora.",
    "rows": [
      [
        "Percepção visual",
        "Discrimina forma, reconhece figura-fundo?",
        "Dificuldade impacta leitura, quebra-cabeças e tarefas de cópia."
      ],
      [
        "Cópia de desenho",
        "Copia formas geométricas com fidelidade?",
        "Dificuldade sugere integração visual-motora comprometida — frequentemente associada à dispraxia."
      ],
      [
        "Perseguição ocular",
        "Acompanha um alvo em movimento com fluidez (sem mover a cabeça)?",
        "Dificuldade sugere controle oculomotor comprometido; impacta leitura e esportes com bola."
      ],
      [
        "Estabilidade ocular",
        "Mantém a fixação visual sustentada em um ponto?",
        "Instabilidade compromete a atenção visual sustentada em tarefas de mesa."
      ]
    ]
  },
  {
    "tick": "bilateral-integration",
    "title": "Integração bilateral",
    "context": "Coordenação dos dois lados do corpo trabalhando juntos, com cruzamento da linha média.",
    "rows": [
      [
        "Cruzamento de linha média",
        "Cruza o corpo naturalmente, ou troca de mão/gira o corpo para evitar?",
        "Evitação sugere integração bilateral/interhemisférica comprometida."
      ],
      [
        "Bolas",
        "Arremessa e recebe usando as duas mãos de forma coordenada?",
        "Dificuldade sugere coordenação bilateral e timing motor comprometidos."
      ],
      [
        "Jumping jacks",
        "Executa o movimento simétrico coordenando braços e pernas?",
        "Assimetria ou desorganização sugere integração bilateral comprometida."
      ],
      [
        "Saltos",
        "Salta de forma simétrica e coordenada?",
        "Dificuldade reforça o quadro de integração bilateral comprometida, junto aos demais itens."
      ]
    ]
  },
  {
    "tick": "motor-planning",
    "title": "Planejamento motor",
    "context": "Capacidade de organizar e executar ações motoras novas com intenção.",
    "rows": [
      [
        "Sequência de ações projetadas",
        "Planeja e executa movimentos com intenção (ex: subir na cadeira para pegar algo)?",
        "Dificuldade é sinal central de comprometimento do planejamento motor (dispraxia)."
      ],
      [
        "Planejamento motor geral",
        "Executa uma sequência motora nova com organização?",
        "Desorganização reforça hipótese de dispraxia; investigar em conjunto com práxis."
      ],
      [
        "Pendurar em equipment",
        "Consegue se pendurar e sustentar o peso do próprio corpo (barra, argolas)?",
        "Evitação/dificuldade sugere insegurança gravitacional combinada a fraqueza proprioceptiva e comprometimento do planejamento motor."
      ]
    ]
  },
  {
    "tick": "praxis",
    "title": "Práxis",
    "context": "Ideação, planejamento e execução de ações motoras — incluindo postura, fala e brincar.",
    "rows": [
      [
        "Práxis postural",
        "Imita ou mantém uma postura corporal nova, não habitual?",
        "Dificuldade é sinal clássico de dispraxia postural."
      ],
      [
        "Práxis oral",
        "Imita ou sequencia movimentos orais (língua, lábios)?",
        "Dificuldade sugere dispraxia oral, podendo relacionar-se à fala e à alimentação."
      ],
      [
        "Brincar",
        "O brincar é elaborado, variado e criativo, ou pobre e repetitivo?",
        "Brincar pobre/repetitivo é um indicador funcional de dificuldade de ideação motora (práxis)."
      ]
    ]
  },
  {
    "tick": "modulation",
    "title": "Modulação e autorregulação",
    "context": "Síntese de como a criança regula a resposta aos estímulos — usada para fechar o raciocínio clínico após observar os sistemas acima.",
    "rows": [
      [
        "Hiper-responsividade em algum sistema",
        "Em qual(is) sistema(s) a criança reage de forma exagerada ao estímulo?",
        "Indica padrão de evitação/defensividade — correlacionar com os achados dos sistemas específicos."
      ],
      [
        "Hipo-responsividade em algum sistema",
        "Em qual(is) sistema(s) a criança registra pouco ou não percebe o estímulo?",
        "Indica sub-registration sensorial — correlaciona com busca sensorial ou letargia, conforme o sistema."
      ],
      [
        "Alerta",
        "O nível de vigília/prontidão está adequado para a tarefa?",
        "Alerta muito baixo ou muito alto compromete a disponibilidade para processar estímulo e aprender."
      ],
      [
        "Ação",
        "O nível de atividade motora está adequado à demanda da tarefa?",
        "Ação em excesso ou em falta reflete a resposta motora à modulação sensorial."
      ],
      [
        "Atenção",
        "Consegue sustentar o foco frente à demanda sensorial da tarefa?",
        "Atenção instável pode ser efeito direto de desregulação sensorial, não apenas de função executiva."
      ],
      [
        "Afeto",
        "A resposta emocional está regulada e compatível com o contexto?",
        "Reações emocionais desproporcionais podem sinalizar sobrecarga sensorial não verbalizada."
      ]
    ]
  }
];

export const FINE_MOTOR_CATEGORIES: RoteiroCategory[] = [
  {
    "tick": "grasp",
    "title": "Preensão de lápis e utensílios",
    "context": "Avalia o tipo de pegada usado para escrever e manusear utensílios, base para eficiência e conforto na escrita.",
    "rows": [
      [
        "Tipo de preensão",
        "A criança usa preensão trípode dinâmica, quadrípode ou padrões atípicos (palmar, pronada)?",
        "Preensões atípicas persistentes após os 5-6 anos podem indicar necessidade de intervenção antes que se tornem hábito consolidado."
      ],
      [
        "Estabilidade do punho",
        "O punho fica em leve extensão e estável, ou cai em flexão excessiva?",
        "Punho instável costuma gerar fadiga rápida e letra irregular por falta de base proximal."
      ],
      [
        "Força de preensão",
        "Aperta o lápis com força excessiva (marcas brancas nos dedos) ou de forma frouxa demais?",
        "Graduação inadequada de força está associada a dificuldades de discriminação proprioceptiva."
      ]
    ]
  },
  {
    "tick": "stroke",
    "title": "Pressão e controle do traço",
    "context": "Observa a qualidade da marca deixada no papel e o controle motor fino durante o traçado.",
    "rows": [
      [
        "Pressão no papel",
        "A pressão é uniforme, ou varia muito (traço muito forte, rasgando o papel, ou muito fraco, quase invisível)?",
        "Pressão excessiva costuma refletir baixo registration proprioceptivo; pressão insuficiente pode indicar hipotonia ou insegurança motora."
      ],
      [
        "Controle de linhas retas e curvas",
        "Consegue seguir uma linha reta e uma curva sem sair do traçado?",
        "Dificuldade em curvas sugere imaturidade do planejamento motor fino e do controle óculo-manual."
      ],
      [
        "Tremor ou hesitação",
        "O traço apresenta tremores, paradas ou repetições no mesmo ponto?",
        "Pode indicar insegurança motora, fadiga muscular ou dificuldade de planejamento da sequência do traço."
      ]
    ]
  },
  {
    "tick": "letters",
    "title": "Formação de letras e números",
    "context": "Analisa a legibilidade e a consistência na formação dos grafemas.",
    "rows": [
      [
        "Forma e proporção",
        "As letras têm tamanho consistente e proporção adequada entre maiúsculas e minúsculas?",
        "Inconsistência de tamanho pode refletir dificuldade de controle motor fino e de percepção visual do espaço da linha."
      ],
      [
        "Direção do traçado",
        "Segue a direção convencional de escrita (de cima para baixo, esquerda para direita) ou inverte o percurso?",
        "Direções atípicas persistentes podem indicar dificuldade de automatização do padrão motor da escrita."
      ],
      [
        "Confusão de letras semelhantes",
        "Troca letras com orientação espacial semelhante (b/d, p/q)?",
        "Comum na fase de alfabetização, mas quando persiste pode refletir dificuldade de discriminação visual-espacial."
      ]
    ]
  },
  {
    "tick": "spatial",
    "title": "Organização espacial na folha",
    "context": "Avalia o uso do espaço da página e a organização visual da escrita.",
    "rows": [
      [
        "Alinhamento na linha",
        "Escreve sobre a linha, ou o texto \"flutua\" acima ou abaixo dela?",
        "Dificuldade de alinhamento pode refletir baixo controle postural-ocular ou percepção espacial imatura."
      ],
      [
        "Espaçamento entre palavras e letras",
        "Mantém espaçamento regular entre letras e palavras, ou aparece tudo colado ou muito espaçado?",
        "Espaçamento irregular pode dificultar a legibilidade e sinalizar planejamento motor pouco automatizado."
      ],
      [
        "Uso da margem e do espaço da página",
        "Organiza o texto respeitando margens, ou invade bordas e espaços de forma desorganizada?",
        "Reflete a capacidade de planejamento espacial mais amplo, além do controle motor da escrita em si."
      ]
    ]
  },
  {
    "tick": "fluency",
    "title": "Velocidade e fluência da escrita",
    "context": "Observa o ritmo e a resistência da criança durante tarefas de escrita mais longas.",
    "rows": [
      [
        "Velocidade em relação à idade/série",
        "A velocidade de escrita está compatível com a esperada para a idade e série escolar?",
        "Lentidão excessiva pode comprometer o acompanhamento do conteúdo em sala e gerar sobrecarga cognitiva."
      ],
      [
        "Fadiga muscular",
        "Reclama de dor ou cansaço na mão após poucos minutos escrevendo?",
        "Pode indicar fraqueza de musculatura intrínseca da mão ou preensão pouco eficiente."
      ],
      [
        "Qualidade ao final da tarefa",
        "A letra piora visivelmente conforme a tarefa avança?",
        "Sugere baixa resistência muscular e a necessidade de pausas programadas durante tarefas longas."
      ]
    ]
  },
  {
    "tick": "scissors",
    "title": "Uso de tesoura e ferramentas",
    "context": "Avalia a coordenação bimanual e o planejamento motor no manuseio de instrumentos escolares.",
    "rows": [
      [
        "Preensão da tesoura",
        "Posiciona os dedos corretamente nos orifícios e mantém o polegar para cima durante o corte?",
        "Preensão inadequada compromete a precisão do corte e pode gerar compensações posturais."
      ],
      [
        "Coordenação das duas mãos",
        "A mão que segura o papel gira e ajusta a folha enquanto a outra corta?",
        "A falta dessa coordenação bimanual dificulta recortes de linhas curvas e contornos."
      ],
      [
        "Precisão do corte",
        "Consegue seguir linhas retas e curvas ao recortar, dentro de uma margem razoável?",
        "Erros grandes e consistentes podem refletir dificuldade de planejamento motor fino combinada à discriminação visual."
      ]
    ]
  }
];

export const FEEDING_SELECTIVITY_CATEGORIES: RoteiroCategory[] = [
  {
    "tick": "textures",
    "title": "Aceitação de texturas",
    "context": "Observa a tolerância e reação da criança a diferentes texturas alimentares.",
    "rows": [
      [
        "Alimentos pastosos/purês",
        "Aceita alimentos pastosos e homogêneos sem reação de desconforto?",
        "Recusa nessa textura básica pode indicar dificuldade motora oral ainda mais precoce que o esperado para a idade."
      ],
      [
        "Alimentos com pedaços/misturados",
        "Tolera alimentos com texturas mistas (ex: sopa com pedaços, arroz com feijão)?",
        "Dificuldade aqui costuma refletir insegurança motora oral ou hipersensibilidade tátil intraoral."
      ],
      [
        "Alimentos crocantes/duros",
        "Aceita morder e mastigar alimentos mais firmes (cenoura crua, torrada)?",
        "Evitação pode indicar fraqueza de musculatura mastigatória ou histórico de experiência negativa, como engasgo."
      ]
    ]
  },
  {
    "tick": "food-groups",
    "title": "Aceitação de cores e grupos alimentares",
    "context": "Mapeia o repertório alimentar em termos de variedade e categorias aceitas.",
    "rows": [
      [
        "Variedade de cores no prato",
        "Aceita alimentos de cores variadas ou tem forte preferência/recusa por cor específica?",
        "Recusa rígida por cor é um padrão comum de seletividade sensorial que restringe a variedade nutricional."
      ],
      [
        "Grupos alimentares aceitos",
        "Quais grupos aceita bem (carboidratos, proteínas, verduras, frutas) e quais evita quase por completo?",
        "Ajuda a mapear riscos nutricionais e prioridades de intervenção junto à nutrição, se necessário."
      ],
      [
        "Marca ou apresentação específica",
        "Só aceita determinada marca, formato ou jeito de apresentação do alimento?",
        "Rigidez de apresentação é comum em perfis com maior necessidade de previsibilidade sensorial."
      ]
    ]
  },
  {
    "tick": "oral-motor",
    "title": "Habilidades oral-motoras",
    "context": "Avalia o controle motor da boca durante a mastigação e a deglutição.",
    "rows": [
      [
        "Vedamento labial",
        "Mantém os lábios fechados durante a mastigação, ou a comida escapa/baba?",
        "Vedamento labial insuficiente pode indicar hipotonia orofacial."
      ],
      [
        "Padrão de mastigação",
        "Mastiga com movimento rotatório de mandíbula, ou apenas movimento vertical (picotar)?",
        "Ausência do padrão rotatório sugere imaturidade do controle motor oral esperado para a idade."
      ],
      [
        "Engasgos ou tosse frequente",
        "Apresenta engasgos, tosse ou \"escape\" de líquido pelo nariz durante a alimentação?",
        "Sinal de atenção que pode indicar necessidade de avaliação fonoaudiológica conjunta para disfagia."
      ]
    ]
  },
  {
    "tick": "mealtime-behavior",
    "title": "Comportamento à mesa",
    "context": "Observa reações comportamentais durante o momento da refeição.",
    "rows": [
      [
        "Reação a alimento novo",
        "Recusa de imediato, cheira/observa antes, ou aceita experimentar com incentivo?",
        "O grau de abertura à exposição orienta a intensidade da estratégia de dessensibilização a ser usada."
      ],
      [
        "Tempo de permanência à mesa",
        "Consegue permanecer sentado durante a refeição completa?",
        "Dificuldade pode estar relacionada a desconforto sensorial, postural ou baixa tolerância à rotina estruturada."
      ],
      [
        "Reação a alimentos que se tocam no prato",
        "Fica angustiada se um alimento \"proibido\" toca em outro no prato?",
        "Padrão comum de rigidez sensorial que pode ser trabalhado com estratégias de dessensibilização gradual."
      ]
    ]
  },
  {
    "tick": "mealtime-routine",
    "title": "Ambiente e rotina alimentar",
    "context": "Contextualiza os fatores ambientais e de rotina que influenciam a alimentação.",
    "rows": [
      [
        "Local e companhia nas refeições",
        "Come sempre no mesmo lugar e com quem? Muda o comportamento em ambientes diferentes (escola, casa de parentes)?",
        "Mudança de ambiente pode revelar o quanto a aceitação alimentar depende de previsibilidade externa."
      ],
      [
        "Uso de distrações (telas)",
        "Só aceita comer assistindo a vídeos ou com outro tipo de distração?",
        "Pode mascarar temporariamente a dificuldade, mas dificulta a generalização da habilidade alimentar."
      ],
      [
        "Autonomia para se alimentar",
        "Come sozinha com talheres apropriados para a idade, ou depende de ajuda constante?",
        "Ajuda a diferenciar dificuldades motoras de dificuldades sensoriais ou comportamentais específicas com o alimento."
      ]
    ]
  }
];

export const ROTEIROS: Roteiro[] = [
  { id: "sensory-integration", label: "Integração Sensorial", categories: SENSORY_INTEGRATION_CATEGORIES },
  { id: "fine-motor", label: "Motricidade Fina e Escrita", categories: FINE_MOTOR_CATEGORIES },
  { id: "feeding-selectivity", label: "Alimentação e Seletividade", categories: FEEDING_SELECTIVITY_CATEGORIES },
];

export function roteiroById(id: string): Roteiro {
  return ROTEIROS.find((r) => r.id === id) ?? ROTEIROS[0];
}

export function roteiroCategoryByTick(roteiro: Roteiro, tick: string): RoteiroCategory {
  return roteiro.categories.find((c) => c.tick === tick) ?? roteiro.categories[0];
}
