import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  PEDI_MOBILIDADE_PROTOCOL_ID,
  PEDI_MOBILIDADE_TEMPLATE,
} from "./template";

export const pediMobilidadeModule = createItemEvaluationModule({
  id: PEDI_MOBILIDADE_PROTOCOL_ID,
  name: "PEDI Mobilidade",
  description: "Avaliação de mobilidade do PEDI (69 itens).",
  template: PEDI_MOBILIDADE_TEMPLATE,
});
