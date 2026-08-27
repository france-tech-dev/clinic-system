import { createItemEvaluationModule } from "../../_shared/create-item-module";
import {
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
  PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
} from "@/domains/protocol/evaluation-modules/terapia-ocupacional/perfil-sensorial-crianca-pequena/template";

export const perfilSensorialCriancaPequenaModule = createItemEvaluationModule({
  id: PERFIL_SENSORIAL_CRIANCA_PEQUENA_PROTOCOL_ID,
  name: "Perfil Sensorial (Criança Pequena)",
  description:
    "Perfil Sensorial — criança pequena, 7 a 35 meses (54 itens).",
  professionId: "terapeuta_ocupacional",
  template: PERFIL_SENSORIAL_CRIANCA_PEQUENA_TEMPLATE,
});
