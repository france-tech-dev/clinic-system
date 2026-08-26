# Inteligência artificial

Assistente clínico baseado no [Vercel AI SDK](https://ai-sdk.dev/), com o primeiro caso de uso na interpretação de protocolos de avaliação.

## Fundação

| Peça                          | Local                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cliente / modelo / stream     | [`packages/shared/src/lib/ai`](../packages/shared/src/lib/ai/index.ts)                                                    |
| Hook client (gerar/stream)    | [`useProtocolInterpretationAI`](../apps/web/src/features/protocol/hooks/use-protocol-interpretation-ai.ts)               |
| Prompt clínico (protocolo)    | [`packages/domains/.../interpretationAI`](../packages/domains/src/protocol/_lib/interpretationAI/prompt.ts)              |
| Somas brutas (determinístico) | [`raw-section-scores.ts`](../packages/domains/src/protocol/_lib/interpretationAI/raw-section-scores.ts)                  |
| Stream HTTP                   | `POST /api/ai/protocol-interpretation-ai`                                                                                 |
| Persistência                  | `ProtocolEvaluation.interpretationAI`                                                                                     |
| Auditoria                     | `AiGenerationLog` (`ai_generation_logs`)                                                                                  |

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

Por janela de 1 hora (tabela `rate_limit`):

- Clínica: `ai:org:{organizationId}` — máx. 40
- Utilizador: `ai:user:{userId}` — máx. 20

## Limites clínicos e privacidade

- **Não inventa T-scores / bandas normativas** — só somas brutas determinísticas + itens; normas oficiais exigem tabelas licenciadas (fase futura).
- Texto é **rascunho assistido** — o profissional deve rever antes de uso clínico.
- Prompt: instrumento, data, primeiro nome, idade (se houver), somas brutas, itens. Sem CPF/contacto.
- Auditoria: `organizationId`, `userId`, `kind`, `evaluationId`, `createdAt` — **sem** texto do prompt/resposta.
- Feature gated: `"ai"` no plano **Enterprise** (trial/legado têm todas as gated features).

## Billing

Gate fino só em actions / route + UI (`canUseAi`). Não no proxy.
