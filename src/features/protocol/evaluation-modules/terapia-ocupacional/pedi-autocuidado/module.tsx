import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  PEDI_AUTOCUIDADO_PROTOCOL_ID,
  PEDI_AUTOCUIDADO_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/pedi-autocuidado/template";

export const pediAutocuidadoModule = createItemEvaluationModule({
  id: PEDI_AUTOCUIDADO_PROTOCOL_ID,
  name: "PEDI Autocuidado",
  description: "Avaliação de autocuidado do PEDI (73 itens).",
  professionId: "terapeuta_ocupacional",
  template: PEDI_AUTOCUIDADO_TEMPLATE,
});
