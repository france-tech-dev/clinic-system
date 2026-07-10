import type { ExerciseCategoryId, ExerciseLevel } from "@/shared/constants/exercise-categories";

export type DefaultExercise = {
  title: string;
  categoryId: ExerciseCategoryId;
  objective: string;
  materials: string;
  instructions: string;
  duration: string;
  level: ExerciseLevel;
};

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  {
    "title": "Pinça de grãos",
    "categoryId": "fina",
    "objective": "Treinar a preensão em pinça fina e a precisão do movimento entre polegar e indicador.",
    "materials": "Dois potes pequenos, feijões ou grão-de-bico, pinça de sobrancelha (opcional)",
    "instructions": "Transferir os grãos, um a um, de um pote para o outro usando a ponta dos dedos ou uma pinça. Aumentar a distância entre os potes para elevar a dificuldade.",
    "duration": "10–15 min",
    "level": "Iniciante"
  },
  {
    "title": "Rosqueamento de porcas e parafusos",
    "categoryId": "fina",
    "objective": "Coordenação bimanual fina e fortalecimento da preensão.",
    "materials": "Parafusos e porcas de tamanhos variados, tábua furada (opcional)",
    "instructions": "Rosquear as porcas nos parafusos alternando as mãos. Cronometrar a atividade para torná-la mais lúdica e desafiadora.",
    "duration": "10 min",
    "level": "Intermediário"
  },
  {
    "title": "Alcance em diferentes planos",
    "categoryId": "grossa",
    "objective": "Ampliar a amplitude de movimento do ombro e o controle postural.",
    "materials": "Objetos leves, prateleira ou mesa em duas alturas",
    "instructions": "Posicionar objetos em alturas variadas (acima da cabeça, altura do peito, no chão) e pedir para alcançar e guardar cada um.",
    "duration": "15 min",
    "level": "Iniciante"
  },
  {
    "title": "Arremesso de bola ao alvo",
    "categoryId": "grossa",
    "objective": "Coordenação óculo-manual e força de membros superiores.",
    "materials": "Bola leve, cesto ou alvo marcado na parede",
    "instructions": "Arremessar a bola ao alvo a partir de distâncias crescentes, sentado ou em pé, conforme tolerância.",
    "duration": "10–15 min",
    "level": "Intermediário"
  },
  {
    "title": "Sequência da rotina matinal",
    "categoryId": "cognicao",
    "objective": "Estimular memória sequencial e planejamento de atividades.",
    "materials": "Cartões ilustrados com etapas da rotina (acordar, escovar dentes, vestir, tomar café)",
    "instructions": "Embaralhar os cartões e pedir para ordená-los na sequência correta, verbalizando cada etapa.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Jogo da memória adaptado",
    "categoryId": "cognicao",
    "objective": "Trabalhar atenção sustentada e memória de curto prazo.",
    "materials": "Cartas de memória com pares de imagens, tamanho ajustável",
    "instructions": "Dispor as cartas viradas para baixo. Virar duas por vez tentando formar pares, reduzindo a quantidade conforme necessário.",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Treino de abotoamento",
    "categoryId": "avd",
    "objective": "Ganhar independência para vestir-se e refinar a coordenação fina.",
    "materials": "Camisa ou avental com botões grandes e pequenos",
    "instructions": "Praticar abotoar e desabotoar, começando pelos botões maiores e avançando gradualmente para os menores.",
    "duration": "10 min",
    "level": "Intermediário"
  },
  {
    "title": "Preparo de lanche simples",
    "categoryId": "avd",
    "objective": "Sequenciamento de tarefas e uso funcional dos membros superiores em atividade de vida diária.",
    "materials": "Pão, frios, faca sem corte, tábua",
    "instructions": "Orientar a montagem de um sanduíche seguindo passos simples, oferecendo pistas verbais conforme a necessidade.",
    "duration": "20 min",
    "level": "Avançado"
  },
  {
    "title": "Caixa sensorial tátil",
    "categoryId": "sensorial",
    "objective": "Trabalhar modulação e discriminação tátil.",
    "materials": "Caixa rasa, arroz cru ou areia cinética, pequenos objetos escondidos",
    "instructions": "Explorar a caixa com as mãos e tentar identificar os objetos escondidos apenas pelo tato.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Estimulação com texturas variadas",
    "categoryId": "sensorial",
    "objective": "Favorecer dessensibilização e ampliar o repertório sensorial tátil.",
    "materials": "Tecidos e materiais de texturas diferentes (algodão, lixa, esponja, EVA)",
    "instructions": "Apresentar cada textura, pedindo que descreva as sensações antes de tocar em objetos do dia a dia.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Cruzamento de linha média",
    "categoryId": "coordenacao",
    "objective": "Integração bilateral e cruzamento da linha média do corpo.",
    "materials": "Objetos pequenos, duas caixas",
    "instructions": "Transferir objetos de uma caixa para outra posicionada do lado oposto do corpo, sem girar o tronco.",
    "duration": "10 min",
    "level": "Intermediário"
  },
  {
    "title": "Circuito de equilíbrio",
    "categoryId": "coordenacao",
    "objective": "Trabalhar equilíbrio dinâmico e coordenação motora global.",
    "materials": "Almofada instável ou colchonete, cones",
    "instructions": "Montar um pequeno circuito com obstáculos e percorrê-lo mantendo o equilíbrio, com supervisão constante.",
    "duration": "15 min",
    "level": "Avançado"
  },
  {
    "title": "Recorte livre com tesoura sem ponta",
    "categoryId": "fina",
    "objective": "Desenvolver a preensão em tesoura e a coordenação óculo-manual para recorte.",
    "materials": "Tesoura sem ponta, papel colorido, linhas guia desenhadas",
    "instructions": "Pedir para recortar seguindo linhas retas e depois curvas, aumentando a complexidade conforme o domínio.",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Enfiar contas em cordão",
    "categoryId": "fina",
    "objective": "Treinar pinça fina, coordenação bimanual e planejamento motor.",
    "materials": "Contas de diferentes tamanhos, cordão ou cadarço rígido na ponta",
    "instructions": "Solicitar que enfie as contas seguindo um padrão de cores ou tamanhos, aumentando a quantidade conforme a habilidade.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Circuito de salto e apoio unipodal",
    "categoryId": "grossa",
    "objective": "Fortalecer membros inferiores e trabalhar equilíbrio dinâmico.",
    "materials": "Arcos, colchonete, fita adesiva para marcar percurso",
    "instructions": "Montar um percurso alternando saltos com os dois pés e apoio em um pé só, cronometrando para tornar desafiador.",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Rastejar e engatinhar em túnel",
    "categoryId": "grossa",
    "objective": "Fortalecer cintura escapular e trabalhar integração bilateral.",
    "materials": "Túnel de brinquedo ou mesa coberta com um cobertor",
    "instructions": "Incentivar a passagem pelo túnel em diferentes velocidades e, se possível, carregando um objeto leve.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Classificação por categorias",
    "categoryId": "cognicao",
    "objective": "Trabalhar raciocínio lógico e categorização.",
    "materials": "Cartões ou objetos de categorias variadas (frutas, animais, roupas)",
    "instructions": "Pedir para agrupar os itens conforme a categoria, aumentando o número de categorias simultâneas conforme o progresso.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Sequência lógica de história",
    "categoryId": "cognicao",
    "objective": "Trabalhar raciocínio sequencial e construção de narrativa.",
    "materials": "Cartões ilustrados de uma pequena história em 4 a 6 cenas",
    "instructions": "Embaralhar os cartões e pedir para reorganizá-los na ordem correta, contando a história em voz alta.",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Treino de calçar e amarrar tênis",
    "categoryId": "avd",
    "objective": "Promover independência para calçar e amarrar os próprios sapatos.",
    "materials": "Tênis com cadarço, cartão de amarrar (opcional)",
    "instructions": "Dividir a tarefa em etapas menores (calçar, cruzar os cadarços, dar o laço) e praticar cada uma isoladamente antes de unir a sequência completa.",
    "duration": "15 min",
    "level": "Avançado"
  },
  {
    "title": "Organização de mochila escolar",
    "categoryId": "avd",
    "objective": "Trabalhar planejamento e organização em uma atividade instrumental de vida diária.",
    "materials": "Mochila, materiais escolares variados, lista de itens necessários",
    "instructions": "Apresentar uma lista simples do que precisa ir na mochila e pedir que organize sozinho, oferecendo pistas visuais se necessário.",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Massagem terapêutica com bola de texturas",
    "categoryId": "sensorial",
    "objective": "Oferecer estímulo proprioceptivo e tátil regulador.",
    "materials": "Bola de borracha com relevo (bolinha ouriço), colchonete",
    "instructions": "Aplicar pressão firme e constante com a bola sobre braços, pernas e costas, sempre com o consentimento e conforto da criança.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Percurso de texturas com os pés descalços",
    "categoryId": "sensorial",
    "objective": "Estimular discriminação tátil plantar e regulação sensorial.",
    "materials": "Tapetes ou bandejas com texturas diferentes (grama sintética, EVA, arroz, algodão)",
    "instructions": "Pedir para caminhar descalço sobre cada textura, descrevendo a sensação em cada trecho do percurso.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Lançamento e recepção de bola com as duas mãos",
    "categoryId": "coordenacao",
    "objective": "Trabalhar coordenação bimanual e antecipação motora.",
    "materials": "Bola de tamanho médio e macia",
    "instructions": "Iniciar com distâncias curtas e lançamentos previsíveis, aumentando a distância e variando a trajetória conforme o domínio.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Circuito de obstáculos com mudança de direção",
    "categoryId": "coordenacao",
    "objective": "Trabalhar coordenação motora global e agilidade.",
    "materials": "Cones, bambolês, fita no chão",
    "instructions": "Montar um percurso com mudanças de direção — zigue-zague, contornar cones, saltar bambolês — e cronometrar as tentativas.",
    "duration": "15 min",
    "level": "Avançado"
  },
  {
    "title": "Comunicação com apoio visual (rotina em cartões)",
    "categoryId": "comunicacao",
    "objective": "Apoiar a expressão de necessidades por meio de comunicação alternativa e aumentativa.",
    "materials": "Cartões de comunicação (CAA) com imagens de rotina e necessidades básicas",
    "instructions": "Apresentar os cartões disponíveis e incentivar a escolha ou o apontar para expressar uma necessidade antes de atendê-la verbalmente.",
    "duration": "10 min",
    "level": "Iniciante"
  },
  {
    "title": "Jogo de perguntas e respostas com turnos",
    "categoryId": "comunicacao",
    "objective": "Trabalhar troca comunicativa, espera de turno e iniciativa de comunicação.",
    "materials": "Dado ou cartas com perguntas simples",
    "instructions": "Alternar perguntas entre terapeuta e criança, incentivando respostas completas e o aguardo da vez do outro.",
    "duration": "10 min",
    "level": "Intermediário"
  },
  {
    "title": "Narrativa de figuras",
    "categoryId": "comunicacao",
    "objective": "Estimular vocabulário expressivo e construção de frases.",
    "materials": "Figuras ou fotos de cenas do dia a dia",
    "instructions": "Pedir para descrever o que está acontecendo na figura, expandindo a frase com perguntas de apoio (quem, o quê, onde).",
    "duration": "15 min",
    "level": "Intermediário"
  },
  {
    "title": "Telefone sem fio adaptado",
    "categoryId": "comunicacao",
    "objective": "Trabalhar compreensão auditiva e reprodução de mensagens simples.",
    "materials": "Nenhum material específico",
    "instructions": "Sussurrar uma frase curta para a criança repetir; aumentar gradualmente o tamanho da frase conforme a habilidade.",
    "duration": "10 min",
    "level": "Avançado"
  },
  {
    "title": "Jogo de tabuleiro cooperativo",
    "categoryId": "participacao",
    "objective": "Promover interação social, espera de turno e tolerância à frustração.",
    "materials": "Jogo de tabuleiro simples e cooperativo",
    "instructions": "Jogar em dupla ou pequeno grupo, mediando as trocas de turno e reforçando comportamentos de cooperação.",
    "duration": "20 min",
    "level": "Intermediário"
  },
  {
    "title": "Roda de apresentação e escuta",
    "categoryId": "participacao",
    "objective": "Trabalhar iniciativa social e escuta ativa em grupo.",
    "materials": "Nenhum material específico, ou um objeto para passar entre os participantes",
    "instructions": "Cada participante compartilha algo breve (nome, brinquedo favorito) enquanto os demais praticam esperar e escutar sem interromper.",
    "duration": "15 min",
    "level": "Iniciante"
  },
  {
    "title": "Brincadeira de faz de conta compartilhada",
    "categoryId": "participacao",
    "objective": "Estimular o brincar simbólico compartilhado e a negociação de papéis.",
    "materials": "Fantoches, bonecos ou objetos temáticos (cozinha, mercadinho)",
    "instructions": "Propor um cenário simples e incentivar a criança a dividir papéis e negociar a história com o parceiro de brincadeira.",
    "duration": "20 min",
    "level": "Intermediário"
  },
  {
    "title": "Combinados para brincar em grupo",
    "categoryId": "participacao",
    "objective": "Trabalhar regras sociais, negociação e resolução de pequenos conflitos.",
    "materials": "Nenhum material específico",
    "instructions": "Antes de uma atividade em grupo, estabelecer com as crianças 2 a 3 combinados simples (esperar a vez, pedir emprestado) e retomá-los durante a brincadeira quando necessário.",
    "duration": "15 min",
    "level": "Avançado"
  }
];
