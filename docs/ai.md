# Inteligência artificial

Assistente clínico baseado no [Vercel AI SDK](https://ai-sdk.dev/), com o primeiro caso de uso na interpretação de protocolos de avaliação.

## Fundação

| Peça                       | Local                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Cliente / modelo / stream  | [`src/shared/lib/ai`](../src/shared/lib/ai/index.ts)                                                      |
| Prompt clínico (protocolo) | [`src/features/protocol/_lib/interpretationAI`](../src/features/protocol/_lib/interpretationAI/prompt.ts) |
| Stream HTTP                | `POST /api/ai/protocol-interpretation`                                                                    |
| Persistência               | `ProtocolEvaluation.interpretationAI`                                                                     |

`shared/lib/ai` não contém regras clínicas — só provider e helpers reutilizáveis. Novos casos (evolução, anamnese) devem acrescentar prompts no respectivo domínio e reutilizar o cliente.

## Variáveis de ambiente

Em [`src/shared/env.ts`](../src/shared/env.ts):

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
2. Clica **Gerar** → `POST /api/ai/protocol-interpretation` com `{ evaluationId }`.
3. Servidor valida sessão, permissão `project:read`, feature gated `ai`, monta preview tipado + primeiro nome/idade, e faz stream do texto.
4. Profissional edita o rascunho e **Guarda** via `saveProtocolInterpretationAction`.

## Limites clínicos e privacidade

- **Não inventa T-scores / bandas normativas** — o sistema ainda não calcula normas SPM; a análise é item a item.
- Texto é **rascunho assistido** — o profissional deve rever antes de uso clínico.
- Prompt envia só: instrumento, data, primeiro nome, idade aproximada (se houver) e itens com rótulos. Sem CPF, contacto ou outros PII.
- Feature gated: `"ai"` no plano **Enterprise** (trial/legado têm todas as gated features).

## Billing

Gate fino só em actions / route + UI (`canUseAi`). Não no proxy.
