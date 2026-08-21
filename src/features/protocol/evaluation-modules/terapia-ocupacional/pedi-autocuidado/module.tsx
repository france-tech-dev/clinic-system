import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  PEDI_AUTOCUIDADO_PROTOCOL_ID,
  PEDI_AUTOCUIDADO_TEMPLATE,
} from "./template";

export const pediAutocuidadoModule = createItemEvaluationModule({
  id: PEDI_AUTOCUIDADO_PROTOCOL_ID,
  name: "PEDI Autocuidado",
  description: "Avaliação de autocuidado do PEDI (73 itens).",
  template: PEDI_AUTOCUIDADO_TEMPLATE,
});
