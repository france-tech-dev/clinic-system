export type DefaultStudyCard = {
  seedKey: string;
  title: string;
  categoryId: string;
  content: string;
  isCustom: boolean;
};

export const DEFAULT_STUDY: DefaultStudyCard[] = [
  {
    "seedKey": "st-1",
    "title": "Modelo Canadense de Desempenho Ocupacional (MCDO)",
    "categoryId": "modelos",
    "content": "Entende o desempenho ocupacional como resultado da relação dinâmica entre pessoa, ambiente e ocupação, organizando as ocupações em autocuidado, produtividade e lazer. É frequentemente usado junto da Medida Canadense de Desempenho Ocupacional, em que o próprio paciente pontua sua percepção de desempenho e satisfação nas atividades que considera importantes. Reforça uma abordagem centrada no cliente, com metas definidas junto com a pessoa atendida.",
    "isCustom": false
  },
  {
    "seedKey": "st-2",
    "title": "Classificação Internacional de Funcionalidade (CIF)",
    "categoryId": "avaliacao",
    "content": "Proposta da Organização Mundial da Saúde, oferece um olhar biopsicossocial sobre a saúde, organizando a funcionalidade em funções e estruturas do corpo, atividades e participação, sempre considerando fatores pessoais e ambientais. Ajuda a situar a avaliação além do diagnóstico, olhando para o impacto real na vida e na participação social da pessoa. É uma linguagem comum útil na comunicação entre diferentes profissionais.",
    "isCustom": false
  },
  {
    "seedKey": "st-3",
    "title": "Modelo de Ocupação Humana (MOHO)",
    "categoryId": "modelos",
    "content": "Descreve a pessoa a partir de três componentes que se influenciam mutuamente: volição (motivação para a ocupação), habituação (padrões e rotinas) e capacidade de desempenho (habilidades físicas e mentais), com o ambiente atuando como facilitador ou barreira. É bastante utilizado para compreender como interesses, valores e senso de eficácia pessoal influenciam o engajamento em atividades ao longo do tempo.",
    "isCustom": false
  },
  {
    "seedKey": "st-4",
    "title": "Pessoa-Ambiente-Ocupação (PEO)",
    "categoryId": "modelos",
    "content": "Representa o desempenho ocupacional como a área de sobreposição entre pessoa, ambiente e ocupação: quanto maior o encaixe entre habilidades, demandas da tarefa e características do ambiente, melhor o desempenho resultante. Um modelo útil para planejar intervenções que não dependem apenas de mudar a pessoa, podendo também adaptar a tarefa ou o ambiente.",
    "isCustom": false
  },
  {
    "seedKey": "st-5",
    "title": "Integração Sensorial",
    "categoryId": "pediatria",
    "content": "Abordagem originada nos trabalhos de A. Jean Ayres, parte da ideia de que a forma como o sistema nervoso processa e organiza informações sensoriais influencia diretamente comportamento e aprendizagem. É amplamente aplicada com crianças que apresentam dificuldades de modulação, discriminação ou processamento sensorial, com atividades envolvendo estímulos proprioceptivos, vestibulares e táteis em contexto lúdico e graduado.",
    "isCustom": false
  },
  {
    "seedKey": "st-6",
    "title": "Escalas de Independência Funcional",
    "categoryId": "avaliacao",
    "content": "Avaliam o quanto uma pessoa consegue realizar atividades básicas e instrumentais de vida diária de forma autônoma, pontuando o nível de assistência necessário em domínios como autocuidado, mobilidade, comunicação e cognição social. Aplicadas de forma seriada, ajudam a documentar a evolução funcional e a embasar decisões sobre alta ou intensidade da intervenção. Vale sempre seguir o manual oficial do instrumento escolhido para garantir confiabilidade na aplicação.",
    "isCustom": false
  },
  {
    "seedKey": "st-7",
    "title": "Conceito Neuroevolutivo (Bobath)",
    "categoryId": "neuro",
    "content": "Abordagem de resolução de problemas voltada para pessoas com alterações de movimento e postura decorrentes de lesões do sistema nervoso central. Prioriza a análise da qualidade do movimento e o manuseio terapêutico para facilitar padrões mais funcionais, em vez de treinar apenas tarefas isoladas. É utilizado tanto em reabilitação infantil quanto em adultos após AVC ou outras lesões neurológicas.",
    "isCustom": false
  },
  {
    "seedKey": "st-8",
    "title": "Saúde Mental e Terapia Ocupacional",
    "categoryId": "saudemental",
    "content": "Na saúde mental, a terapia ocupacional favorece o engajamento em ocupações significativas como parte do processo de recuperação, e não apenas o foco na remissão de sintomas. O trabalho costuma envolver rotina, papéis ocupacionais, autonomia e reinserção social, considerando o contexto de vida da pessoa. Grupos terapêuticos, oficinas e projetos comunitários são recursos comuns nessa área de atuação.",
    "isCustom": false
  },
  {
    "seedKey": "st-9",
    "title": "Nomenclatura da Integração Sensorial de Ayres: conceitos, observação e atividades",
    "categoryId": "pediatria",
    "content": "O QUE É\nA Integração Sensorial de Ayres (ASI) é o referencial teórico e prático desenvolvido por A. Jean Ayres que explica como o sistema nervoso central recebe, organiza e interpreta as informações sensoriais do corpo e do ambiente para gerar respostas adaptativas. A nomenclatura da área descreve tanto os sistemas sensoriais trabalhados quanto os processos neurológicos e os padrões observados na prática clínica.\n\nSISTEMAS SENSORIAIS DE BASE\n\nTátil — processamento do toque, pressão, textura e dor pela pele.\nComo observar: reação exagerada ou ausente a texturas, roupas e toque de outras pessoas; seletividade alimentar por textura; dificuldade em reconhecer objetos só pelo tato (estereognosia).\nAtividades: caixa sensorial tátil com texturas variadas; pintura com as mãos; jogo de identificar objetos escondidos só pelo tato; pressão profunda com bolinhas ou rolos texturizados.\n\nVestibular — processamento do movimento, da gravidade e da posição da cabeça, captado pelo ouvido interno.\nComo observar: medo de altura ou de balançar (insegurança gravitacional) ou, no extremo oposto, busca constante por girar, balançar e correr sem se cansar; quedas frequentes; dificuldade de manter o equilíbrio.\nAtividades: balanço terapêutico, rede, prancha de equilíbrio, cama elástica, gangorra, andar sobre linha reta ou trave baixa.\n\nProprioceptivo — processamento da posição e da força muscular e articular, dando noção do próprio corpo no espaço.\nComo observar: força mal graduada (aperta demais ou de menos), tropeços frequentes, busca por empurrar, puxar, colidir ou se jogar em almofadas.\nAtividades: empurrar ou puxar objetos pesados, carregar mochila com peso adequado, pular em colchão, atividades de \"trabalho pesado\" como amassar massinha, subir em cordas, engatinhar em túnel.\n\nMODULAÇÃO SENSORIAL\n\nHiper-responsividade — reação exagerada, de defesa ou desconforto diante de estímulos comuns.\nComo observar: tampa os ouvidos com sons do dia a dia, evita certas texturas de roupa ou comida, se incomoda com toque leve inesperado.\nAtividades: dessensibilização gradual com estímulos previsíveis e controlados pela própria criança, pressão profunda antes de estímulos leves, rotina de preparo sensorial antes de tarefas desafiadoras.\n\nHipo-responsividade — resposta diminuída ou ausente ao estímulo; a criança \"não registra\" a informação.\nComo observar: não percebe quando se machuca, não reage ao nome chamado, parece dispersa ou \"no seu próprio mundo\", precisa de estímulo intenso para se engajar.\nAtividades: estímulos de maior intensidade e curta duração, atividades de alerta rápido (pular, girar, sons e luzes diferentes), aumentar o contraste sensorial das tarefas.\n\nBusca sensorial — procura ativa e frequente por estímulos intensos.\nComo observar: bate, colide, morde objetos, gira sem apresentar tontura aparente, mexe constantemente em tudo que vê.\nAtividades: circuito motor com estações de impacto controlado, balanço vigoroso supervisionado, atividades estruturadas de input proprioceptivo e vestibular intenso.\n\nDISCRIMINAÇÃO SENSORIAL\nCapacidade de diferenciar qualidades e localizar com precisão um estímulo — de onde veio, o que é, o quanto.\nComo observar: erra a localização de um toque; dificuldade em reconhecer objetos pelo tato sem olhar; erro de posição do próprio braço ou perna com os olhos fechados (cinestesia); dificuldade em graduar força.\nAtividades: jogo de adivinhar objetos na caixa tátil, imitar posturas com os olhos fechados, tarefas de encaixe e classificação por tato.\n\nPRÁXIS (IDEAÇÃO, PLANEJAMENTO MOTOR E EXECUÇÃO)\nCapacidade de conceber, organizar e executar uma ação motora nova e não habitual — quando comprometida, é chamada de dispraxia.\nComo observar: dificuldade em iniciar uma brincadeira nova; desorganização ao copiar um movimento; brincar pobre, repetitivo, pouco criativo; muitas tentativas e erros para aprender uma sequência simples.\nAtividades: circuitos motores com obstáculos variados e trocados com frequência, imitação de posturas e sequências de movimento, faz de conta que exige planejar etapas, montar percursos com o próprio corpo.\n\nINTEGRAÇÃO BILATERAL E SEQUENCIAMENTO (BIS)\nCapacidade de coordenar os dois lados do corpo trabalhando juntos, incluindo o cruzamento da linha média.\nComo observar: troca de mão ou gira o corpo para evitar cruzar a linha média; dificuldade em atividades simétricas como polichinelo; desorganização ao usar as duas mãos em tarefas diferentes ao mesmo tempo.\nAtividades: bater palmas cruzando o corpo, jogos de bola que exigem pegar de um lado e lançar do outro, desenhar em oito (símbolo do infinito), rasgar papel com as duas mãos em direções opostas.\n\nCONTROLE POSTURAL-OCULAR\nBase de sustentação postural e de movimento coordenado dos olhos, essencial para tarefas de mesa e esportes.\nComo observar: dificuldade em seguir um alvo em movimento sem mover a cabeça; perde a linha ao copiar do quadro; cansaço postural rápido ao sentar.\nAtividades: seguir bolinha ou lanterna com os olhos, equilíbrio em prono sobre bola suíça, jogos de rebater ou pegar objetos em movimento.\n\nINSEGURANÇA GRAVITACIONAL E DEFENSIVIDADE TÁTIL\nDois padrões específicos e frequentes de hiper-responsividade: medo intenso e desproporcional de ter os pés fora do chão ou mudar de posição no espaço (insegurança gravitacional), e desconforto ou reação de alarme frente ao toque, sobretudo leve e inesperado (defensividade tátil).\nComo observar: recusa em subir em brinquedos de playground, ansiedade visível em atividades de balanço; evita fila, aglomeração, corte de cabelo, escovação dos dentes.\nAtividades: progressão gradual de desafios de equilíbrio com apoio de segurança e escolha da criança sobre o ritmo; introdução de toque sempre de forma previsível e com pressão firme, já que o toque leve costuma incomodar mais.",
    "isCustom": false
  }
];
