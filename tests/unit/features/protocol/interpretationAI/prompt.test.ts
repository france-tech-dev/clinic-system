import { describe, expect, it } from "vitest";
import type { ProtocolEvaluationPreviewDTO } from "@/features/protocol/protocol.types";
import {
  ageYearsFromBirthDate,
  buildProtocolInterpretationAIPrompt,
  patientFirstName,
  PROTOCOL_INTERPRETATION_AI_SYSTEM_PROMPT,
} from "@/features/protocol/_lib/interpretationAI/prompt";

const fixturePreview: ProtocolEvaluationPreviewDTO = {
  id: "eval_1",
  protocolId: "spm-casa-5anos",
  protocolName: "SPM Casa (5 anos)",
  date: "2026-08-19",
  interpretationAI: null,
  interpretationAIUpdatedAt: null,
  sections: [
    {
      id: "audicao",
      title: "Audição",
      items: [
        {
          id: "audicao-01",
          label: "Reage a sons domésticos cotidianos",
          valueLabel: "S · Sempre",
        },
        {
          id: "audicao-02",
          label: "Não reage a sons ambientais contínuos",
          valueLabel: "N · Nunca",
        },
      ],
    },
    {
      id: "tato",
      title: "Tato",
      items: [
        {
          id: "tato-01",
          label: "Recua ao toque leve",
          valueLabel: "S · Sempre",
        },
      ],
    },
  ],
};

describe("buildProtocolInterpretationAIPrompt", () => {
  it("inclui system prompt com regras clínicas e estrutura", () => {
    const prompt = buildProtocolInterpretationAIPrompt(fixturePreview, {
      patientFirstName: "Sara",
      patientAgeYears: 5,
    });

    expect(prompt.system).toBe(PROTOCOL_INTERPRETATION_AI_SYSTEM_PROMPT);
    expect(prompt.system).toContain("NÃO inventes T-scores");
    expect(prompt.system).toContain("ANÁLISE ITEM A ITEM");
  });

  it("monta user com instrumento, meta mínima e itens por secção", () => {
    const prompt = buildProtocolInterpretationAIPrompt(fixturePreview, {
      patientFirstName: "Sara",
      patientAgeYears: 5,
    });

    expect(prompt.user).toContain("SPM Casa (5 anos)");
    expect(prompt.user).toContain("spm-casa-5anos");
    expect(prompt.user).toContain("2026-08-19");
    expect(prompt.user).toContain("Sara");
    expect(prompt.user).toContain("Idade aproximada: 5 anos");
    expect(prompt.user).toContain("## Audição");
    expect(prompt.user).toContain("[audicao-01]");
    expect(prompt.user).toContain("S · Sempre");
    expect(prompt.user).not.toMatch(/cpf|email|telefone|@/i);
  });

  it("inclui pontuações brutas quando fornecidas", () => {
    const prompt = buildProtocolInterpretationAIPrompt(
      fixturePreview,
      { patientFirstName: "Sara", patientAgeYears: 5 },
      "- Audição: bruto 10 (2/2 respondidos)",
    );
    expect(prompt.user).toContain("Pontuações brutas por secção");
    expect(prompt.user).toContain("bruto 10");
    expect(prompt.system).toContain("NÃO são T-scores");
  });

  it("omite idade quando desconhecida", () => {
    const prompt = buildProtocolInterpretationAIPrompt(fixturePreview, {
      patientFirstName: "Sara",
      patientAgeYears: null,
    });
    expect(prompt.user).toContain("Idade: não informada");
  });
});

describe("patientFirstName", () => {
  it("retorna só o primeiro token", () => {
    expect(patientFirstName("Sara Silva Costa")).toBe("Sara");
    expect(patientFirstName("  Ana  ")).toBe("Ana");
  });
});

describe("ageYearsFromBirthDate", () => {
  it("calcula anos completos", () => {
    const now = new Date(2026, 7, 24);
    expect(ageYearsFromBirthDate(new Date(2021, 7, 20), now)).toBe(5);
    expect(ageYearsFromBirthDate(new Date(2021, 8, 1), now)).toBe(4);
  });

  it("retorna null sem data", () => {
    expect(ageYearsFromBirthDate(null)).toBeNull();
    expect(ageYearsFromBirthDate(undefined)).toBeNull();
  });
});
