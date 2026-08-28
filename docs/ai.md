# Inteligência artificial

Assistente clínico baseado no [Vercel AI SDK](https://ai-sdk.dev/), com o primeiro caso de uso na interpretação de protocolos de avaliação.

## Fundação

| Peça                          | Local                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| Cliente / modelo / stream     | [`src/shared/lib/ai`](../src/shared/lib/ai/index.ts)                                              |
| Hook client (gerar/stream)    | [`useProtocolInterpretationAI`](../src/features/protocol/hooks/use-protocol-interpretation-ai.ts) |
| Prompt clínico (protocolo)    | [`interpretationAI`](../src/domains/protocol/_lib/interpretationAI/prompt.ts)                     |
| Somas brutas (determinístico) | [`raw-section-scores.ts`](../src/domains/protocol/_lib/interpretationAI/raw-section-scores.ts)    |
| Stream HTTP                   | `POST /api/ai/protocol-interpretation-ai`                                                         |
| Persistência                  | `ProtocolEvaluation.interpretationAI`                                                             |
| Auditoria                     | `AiGenerationLog` (`ai_generation_logs`)                                                          |

`shared/lib/ai` não contém regras clínicas — só provider e helpers reutilizáveis. Novos casos (evolução, anamnese) devem acrescentar prompts no respectivo domínio e reutilizar o cliente.

## Variáveis de ambiente

Em [`packages/shared/src/env.ts`](../packages/shared/src/env.ts):

```env
# Provider: google (default) | openai
AI_PROVIDER="google"

# Google Gemini (AI Studio) — free tier para testes
GOOGLE_GENERATIVE_AI_API_KEY="..."
# opcional (default gemini-2.5-flash)
# AI_MODEL="gemini-2.5-flash"

# OpenAI (alternativa)
# AI_PROVIDER="openai"
# OPENAI_API_KEY="sk-..."
# AI_MODEL="gpt-5-mini"
```

Chave em [Google AI Studio](https://aistudio.google.com/apikey). Sem a chave do provider activo, a rota devolve 503. As chaves são opcionais no boot da app.

## Fluxo (interpretação de protocolo)

1. Profissional abre respostas do link público (paciente → Links públicos).
2. Clica **Gerar** (ou **Parar** a meio) → hook `useProtocolInterpretationAI` → `POST /api/ai/protocol-interpretation-ai`.
3. Servidor: rate limit org/user → auditoria → preview + somas brutas → stream.
4. Profissional edita o rascunho e **Salva** via `saveProtocolInterpretationAIAction`.

## Rate limit

Dois regimes, conforme billing da clínica:

| Regime                      | Clínica     | Utilizador  | Janela                                                                                  |
| --------------------------- | ----------- | ----------- | --------------------------------------------------------------------------------------- |
| **Período de teste**        | 20 gerações | 10 gerações | Desde o início do trial (`trialEndsAt − TRIAL_DAYS`) — contagem em `ai_generation_logs` |
| **Plano pago (Enterprise)** | 40          | 20          | 1 hora (`rate_limit`)                                                                   |

Constantes: [`src/shared/constants/ai-limits.ts`](../src/shared/constants/ai-limits.ts)  
Enforcement: [`src/shared/lib/ai/generation-limit.ts`](../src/shared/lib/ai/generation-limit.ts)

A quota de trial é carregada no servidor (página do paciente), injectada via `AiTrialQuotaProvider` na tab de links públicos e mostrada no painel de interpretação.

## Limites clínicos e privacidade

- **Não inventa T-scores / bandas normativas** — só somas brutas determinísticas + itens; normas oficiais exigem tabelas licenciadas — ver [`avaliacao/scoring-oficial-to.md`](./avaliacao/scoring-oficial-to.md).
- Texto é **rascunho assistido** — o profissional deve rever antes de uso clínico.
- Prompt: instrumento, data, primeiro nome, idade (se houver), somas brutas, itens. Sem CPF/contacto.
- Auditoria: `organizationId`, `userId`, `kind`, `evaluationId`, `createdAt` — **sem** texto do prompt/resposta.
- Feature gated: `"ai"` no plano **Enterprise** (trial/legado têm todas as gated features).

## Billing

Gate fino só em actions / route + UI (`canUseAi`). Não no proxy.
