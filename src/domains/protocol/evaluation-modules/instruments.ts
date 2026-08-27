import type { HealthProfessionId } from "@/shared/constants/professions";
import type { ItemProtocolTemplate } from "./_shared/item-protocol-template";
import type { CatalogEvaluationDef } from "./types";
import {
  GMFM88_PROTOCOL_ID,
} from "./fisioterapia/gmfm-88/template";
import {
  PEDI_AUTOCUIDADO_PROTOCOL_ID,
  PEDI_AUTOCUIDADO_TEMPLATE,
} from "./terapia-ocupacional/pedi-autocuidado/template";
import {
  PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
  PEDI_FUNCAO_SOCIAL_TEMPLATE,
} from "./terapia-ocupacional/pedi-funcao-social/template";
import {
  PEDI_MOBILIDADE_PROTOCOL_ID,
  PEDI_MOBILIDADE_TEMPLATE,
} from "./terapia-ocupacional/pedi-mobilidade/template";
import {
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
} from "./terapia-ocupacional/perfil-sensorial-crianca-pequena/template";
import {
  SPM_CASA_2ANOS_PROTOCOL_ID,
  SPM_CASA_2ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-casa-2anos/template";
import {
  SPM_CASA_3ANOS_PROTOCOL_ID,
  SPM_CASA_3ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-casa-3anos/template";
import {
  SPM_CASA_5ANOS_PROTOCOL_ID,
  SPM_CASA_5ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-casa-5anos/template";
import {
  SPM_ESCOLA_2ANOS_PROTOCOL_ID,
  SPM_ESCOLA_2ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-escola-2anos/template";
import {
  SPM_ESCOLA_3ANOS_PROTOCOL_ID,
  SPM_ESCOLA_3ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-escola-3anos/template";
import {
  SPM_ESCOLA_5ANOS_PROTOCOL_ID,
  SPM_ESCOLA_5ANOS_TEMPLATE,
} from "./terapia-ocupacional/spm-escola-5anos/template";

export type ProtocolInstrument = CatalogEvaluationDef & {
  professionId: HealthProfessionId;
  supportsPublicInvite?: boolean;
  template?: ItemProtocolTemplate;
};

const PROTOCOL_INSTRUMENTS: ProtocolInstrument[] = [
  {
    id: GMFM88_PROTOCOL_ID,
    name: "GMFM-88",
    description: "Avalia a função motora grossa em 5 domínios (88 itens).",
    professionId: "fisioterapeuta",
  },
  {
    id: PEDI_AUTOCUIDADO_PROTOCOL_ID,
    name: "PEDI Autocuidado",
    description: "Avaliação de autocuidado do PEDI (73 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: PEDI_AUTOCUIDADO_TEMPLATE,
  },
  {
    id: PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
    name: "PEDI Função Social",
    description: "Avaliação de função social do PEDI (65 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: PEDI_FUNCAO_SOCIAL_TEMPLATE,
  },
  {
    id: PEDI_MOBILIDADE_PROTOCOL_ID,
    name: "PEDI Mobilidade",
    description: "Avaliação de mobilidade do PEDI (69 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: PEDI_MOBILIDADE_TEMPLATE,
  },
  {
    id: PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
    name: "Perfil Sensorial (Criança Pequena)",
    description:
      "Perfil Sensorial — criança pequena, 7 a 35 meses (54 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
  },
  {
    id: SPM_CASA_2ANOS_PROTOCOL_ID,
    name: "SPM Casa (2 anos)",
    description: "Sensory Processing Measure — casa, 2 anos (75 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_CASA_2ANOS_TEMPLATE,
  },
  {
    id: SPM_CASA_3ANOS_PROTOCOL_ID,
    name: "SPM Casa (3 anos)",
    description: "Sensory Processing Measure — casa, 3 anos (75 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_CASA_3ANOS_TEMPLATE,
  },
  {
    id: SPM_CASA_5ANOS_PROTOCOL_ID,
    name: "SPM Casa (5 anos)",
    description: "Sensory Processing Measure — casa, 5 anos (75 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_CASA_5ANOS_TEMPLATE,
  },
  {
    id: SPM_ESCOLA_2ANOS_PROTOCOL_ID,
    name: "SPM Escola (2 anos)",
    description: "Sensory Processing Measure — escola, 2 anos (75 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_ESCOLA_2ANOS_TEMPLATE,
  },
  {
    id: SPM_ESCOLA_3ANOS_PROTOCOL_ID,
    name: "SPM Escola (3 anos)",
    description: "Sensory Processing Measure — escola, 3 anos (75 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_ESCOLA_3ANOS_TEMPLATE,
  },
  {
    id: SPM_ESCOLA_5ANOS_PROTOCOL_ID,
    name: "SPM Escola (5 anos)",
    description: "Sensory Processing Measure — escola, 5 anos (62 itens).",
    professionId: "terapeuta_ocupacional",
    supportsPublicInvite: true,
    template: SPM_ESCOLA_5ANOS_TEMPLATE,
  },
];

export function listProtocolInstruments(): ProtocolInstrument[] {
  return PROTOCOL_INSTRUMENTS;
}

export function getProtocolInstrument(
  id: string,
): ProtocolInstrument | undefined {
  return PROTOCOL_INSTRUMENTS.find((instrument) => instrument.id === id);
}
