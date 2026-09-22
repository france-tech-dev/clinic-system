import type { ProtocolInstrument } from "../_shared/define-instrument";
import { summarizeGmfm88, type Gmfm88Scores } from "./gmfm-88/scoring";
import { GMFM88_PROTOCOL_ID } from "./gmfm-88/template";

/** Metadados server dos instrumentos de fisioterapia. */
export const FISIOTERAPIA_INSTRUMENTS: ProtocolInstrument[] = [
  {
    id: GMFM88_PROTOCOL_ID,
    name: "GMFM-88",
    description: "Avalia a função motora grossa em 5 domínios (88 itens).",
    professionId: "fisioterapeuta",
    family: "gmfm",
    abbrev: "GM",
    summarize: (scores) => summarizeGmfm88(scores as Gmfm88Scores),
  },
];
