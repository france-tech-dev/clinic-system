import {
  defineItemProtocolInstrument,
  type ItemProtocolInstrument,
} from "../_shared/define-instrument";
import type { ItemProtocolTemplate } from "../_shared/item-protocol-template";
import { scoreSpm, type SpmNormsTable } from "./_lib/spm/score";
import {
  PEDI_AUTOCUIDADO_PROTOCOL_ID,
  PEDI_AUTOCUIDADO_TEMPLATE,
} from "./pedi-autocuidado/template";
import {
  PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
  PEDI_FUNCAO_SOCIAL_TEMPLATE,
} from "./pedi-funcao-social/template";
import {
  PEDI_MOBILIDADE_PROTOCOL_ID,
  PEDI_MOBILIDADE_TEMPLATE,
} from "./pedi-mobilidade/template";
import {
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
} from "./perfil-sensorial-crianca-pequena/template";
import {
  SPM_CASA_2ANOS_PROTOCOL_ID,
  SPM_CASA_2ANOS_TEMPLATE,
} from "./spm-casa-2anos/template";
import {
  SPM_CASA_3ANOS_PROTOCOL_ID,
  SPM_CASA_3ANOS_TEMPLATE,
} from "./spm-casa-3anos/template";
import { SPM_CASA_5ANOS_NORMS } from "./spm-casa-5anos/norms";
import {
  SPM_CASA_5ANOS_PROTOCOL_ID,
  SPM_CASA_5ANOS_TEMPLATE,
} from "./spm-casa-5anos/template";
import {
  SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  SPM_ESCOLA_2ANOS_TEMPLATE,
} from "./spm-escola-2anos/template";
import {
  SPM_ESCOLA_3ANOS_PROTOCOL_ID,
  SPM_ESCOLA_3ANOS_TEMPLATE,
} from "./spm-escola-3anos/template";
import {
  SPM_ESCOLA_5ANOS_PROTOCOL_ID,
  SPM_ESCOLA_5ANOS_TEMPLATE,
} from "./spm-escola-5anos/template";

function defineSpm(opts: {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  template: ItemProtocolTemplate;
  norms?: SpmNormsTable;
}): ItemProtocolInstrument {
  const { template, norms = null, ...meta } = opts;
  return defineItemProtocolInstrument({
    ...meta,
    professionId: "terapeuta_ocupacional",
    abbrev: "SP",
    supportsPublicInvite: true,
    template,
    summarize: (scores) => scoreSpm(template, scores, norms),
  });
}

/** Metadados server dos instrumentos de terapia ocupacional. */
export const TERAPIA_OCUPACIONAL_INSTRUMENTS: ItemProtocolInstrument[] = [
  defineItemProtocolInstrument({
    id: PEDI_AUTOCUIDADO_PROTOCOL_ID,
    name: "PEDI Autocuidado",
    description: "Avaliação de autocuidado do PEDI (73 itens).",
    professionId: "terapeuta_ocupacional",
    abbrev: "PD",
    supportsPublicInvite: true,
    template: PEDI_AUTOCUIDADO_TEMPLATE,
  }),
  defineItemProtocolInstrument({
    id: PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
    name: "PEDI Função Social",
    description: "Avaliação de função social do PEDI (65 itens).",
    professionId: "terapeuta_ocupacional",
    abbrev: "PD",
    supportsPublicInvite: true,
    template: PEDI_FUNCAO_SOCIAL_TEMPLATE,
  }),
  defineItemProtocolInstrument({
    id: PEDI_MOBILIDADE_PROTOCOL_ID,
    name: "PEDI Mobilidade",
    description: "Avaliação de mobilidade do PEDI (69 itens).",
    professionId: "terapeuta_ocupacional",
    abbrev: "PD",
    supportsPublicInvite: true,
    template: PEDI_MOBILIDADE_TEMPLATE,
  }),
  defineItemProtocolInstrument({
    id: PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
    name: "Perfil Sensorial (Criança Pequena)",
    description: "Perfil Sensorial — criança pequena, 7 a 35 meses (54 itens).",
    professionId: "terapeuta_ocupacional",
    abbrev: "PS",
    subtitle: "Criança Pequena",
    supportsPublicInvite: true,
    template: PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
  }),
  defineSpm({
    id: SPM_CASA_2ANOS_PROTOCOL_ID,
    name: "SPM Casa (2 anos)",
    description: "Sensory Processing Measure — casa, 2 anos (75 itens).",
    subtitle: "Casa · 2 anos",
    template: SPM_CASA_2ANOS_TEMPLATE,
  }),
  defineSpm({
    id: SPM_CASA_3ANOS_PROTOCOL_ID,
    name: "SPM Casa (3 anos)",
    description: "Sensory Processing Measure — casa, 3 anos (75 itens).",
    subtitle: "Casa · 3 anos",
    template: SPM_CASA_3ANOS_TEMPLATE,
  }),
  defineSpm({
    id: SPM_CASA_5ANOS_PROTOCOL_ID,
    name: "SPM Casa (5 anos)",
    description: "Sensory Processing Measure — casa, 5 anos (75 itens).",
    subtitle: "Casa · 5 anos",
    template: SPM_CASA_5ANOS_TEMPLATE,
    norms: SPM_CASA_5ANOS_NORMS,
  }),
  defineSpm({
    id: SPM_ESCOLA_2ANOS_PROTOCOL_ID,
    name: "SPM Escola (2 anos)",
    description: "Sensory Processing Measure — escola, 2 anos (75 itens).",
    subtitle: "Escola · 2 anos",
    template: SPM_ESCOLA_2ANOS_TEMPLATE,
  }),
  defineSpm({
    id: SPM_ESCOLA_3ANOS_PROTOCOL_ID,
    name: "SPM Escola (3 anos)",
    description: "Sensory Processing Measure — escola, 3 anos (75 itens).",
    subtitle: "Escola · 3 anos",
    template: SPM_ESCOLA_3ANOS_TEMPLATE,
  }),
  defineSpm({
    id: SPM_ESCOLA_5ANOS_PROTOCOL_ID,
    name: "SPM Escola (5 anos)",
    description: "Sensory Processing Measure — escola, 5 anos (62 itens).",
    subtitle: "Escola · 5 anos",
    template: SPM_ESCOLA_5ANOS_TEMPLATE,
  }),
];
