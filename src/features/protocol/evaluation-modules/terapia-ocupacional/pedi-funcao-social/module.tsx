import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
  PEDI_FUNCAO_SOCIAL_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/pedi-funcao-social/template";

export const pediFuncaoSocialModule = createItemEvaluationModule({
  id: PEDI_FUNCAO_SOCIAL_PROTOCOL_ID,
  name: "PEDI Função Social",
  description: "Avaliação de função social do PEDI (65 itens).",
  professionId: "terapeuta_ocupacional",
  template: PEDI_FUNCAO_SOCIAL_TEMPLATE,
});
