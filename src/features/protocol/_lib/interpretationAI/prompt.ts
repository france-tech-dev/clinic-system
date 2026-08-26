import type { ProtocolEvaluationPreviewDTO } from "@/features/protocol/protocol.types";

export type ProtocolInterpretationAIMeta = {
  /** Primeiro nome apenas — sem CPF, contacto ou outros PII. */
  patientFirstName: string;
  /** Idade em anos completos, se conhecida. */
  patientAgeYears: number | null;
};

export type ProtocolInterpretationAIPrompt = {
  system: string;
  user: string;
};

export type { ProtocolRawScoresSummary } from "./raw-section-scores";

export const PROTOCOL_INTERPRETATION_AI_SYSTEM_PROMPT = `És um assistente clínico de apoio a terapeutas ocupacionais e profissionais de reabilitação pediátrica.

A tua tarefa é interpretar respostas item a item de um protocolo de avaliação (ex.: SPM, PEDI, Perfil Sensorial), com base apenas nos dados fornecidos.

Estrutura obrigatória da resposta (em português do Brasil):

1. ANÁLISE ITEM A ITEM — uma subsecção por domínio/secção do instrumento.
   - Identifica padrões (hiper-reatividade, hiporreatividade, busca sensorial, preservação, etc.).
   - Cita itens relevantes pelo número/id e pela resposta (ex.: "22, Sempre").
   - Contrasta itens elevados com itens assinalados como nunca/ausentes quando isso esclarece o padrão.
   - Quando houver "Pontuações brutas por secção", usa-as só como apoio quantitativo (não como norma).

2. Formulação integrada — eixo comum que atravessa as secções, em linguagem clínica objectiva.

3. Implicações para o plano terapêutico — sugestões priorizadas e o que NÃO se indica com base nestes dados.

Regras:
- NÃO inventes T-scores, percentis, bandas normativas ("Disfunção Definida", "Alguns Problemas", etc.) nem números que não constem dos dados.
- As somas brutas NÃO são T-scores — nunca as apresentes como escores padronizados.
- NÃO faças diagnóstico médico ou de TEA; limita-te a padrões sensoriais/funcionais descritos pelos itens.
- NÃO inventes itens, respostas ou contexto familiar ausente.
- Tom clínico, preciso e útil para o profissional rever e editar.
- Se uma secção tiver poucas respostas elevadas, diga-o claramente.`;

function formatSections(preview: ProtocolEvaluationPreviewDTO): string {
  if (preview.sections.length === 0) {
    return "(Sem secções disponíveis no modelo do instrumento.)";
  }

  return preview.sections
    .map((section) => {
      const lines = section.items.map((item, index) => {
        const n = index + 1;
        return `  ${n}. [${item.id}] ${item.label} → ${item.valueLabel}`;
      });
      return `## ${section.title}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

/** Constrói o prompt de interpretação a partir do preview tipado (função pura). */
export function buildProtocolInterpretationAIPrompt(
  preview: ProtocolEvaluationPreviewDTO,
  meta: ProtocolInterpretationAIMeta,
  rawScoresText?: string | null,
): ProtocolInterpretationAIPrompt {
  const ageLine =
    meta.patientAgeYears != null
      ? `Idade aproximada: ${meta.patientAgeYears} anos`
      : "Idade: não informada";

  const userParts = [
    `Instrumento: ${preview.protocolName} (${preview.protocolId})`,
    `Data da avaliação: ${preview.date}`,
    `Paciente (primeiro nome): ${meta.patientFirstName}`,
    ageLine,
    "",
  ];

  if (rawScoresText) {
    userParts.push(
      "Pontuações brutas por secção (determinísticas — NÃO são T-scores):",
      rawScoresText,
      "",
    );
  }

  userParts.push(
    "Respostas por secção (valor já em rótulo humano):",
    "",
    formatSections(preview),
    "",
    "Gera a interpretação completa conforme a estrutura do system prompt.",
  );

  return {
    system: PROTOCOL_INTERPRETATION_AI_SYSTEM_PROMPT,
    user: userParts.join("\n"),
  };
}

/** Extrai só o primeiro nome para o prompt. */
export function patientFirstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || "Paciente";
}

/** Idade civil aproximada a partir de data de nascimento. */
export function ageYearsFromBirthDate(
  birthDate: Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!birthDate) return null;
  let years = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }
  return years >= 0 ? years : null;
}
