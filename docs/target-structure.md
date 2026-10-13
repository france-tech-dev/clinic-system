# Estrutura-alvo — Fastify (fase 2)

**Hoje (fase 1):** árvore canónica em [`architecture.md`](./architecture.md) — `src/` + `consumer/`, sem monorepo.

**Decisão:** o split real é **Next (UI) ↔ Fastify (HTTP)**. Packages npm só compensam com ≥2 processos a partilhar o mesmo core (web + api + consumer). Até lá, monorepo/`@clinic/*` só aumenta ruído.

Complementa [`architecture.md`](./architecture.md), [`bounded-contexts.md`](./bounded-contexts.md) e [`jobs-queues.md`](./jobs-queues.md).

---

## Fase 1 — pointer

Negócio em `src/domains` (server-only); UI em `features/` ou `_components/`; consumer BullMQ na raiz (`tsx consumer/index.ts`); `REDIS_URL` obrigatória. Detalhe e responsabilidades: [`architecture.md`](./architecture.md).

---

## Fase 2 — Fastify + monorepo leve

Só quando a API HTTP for produto real:

```
clinic-system/
├── apps/
│   ├── web/                  # Next — UI; consome HTTP
│   ├── api/                  # ★ Fastify — rotas → packages/domains
│   └── consumer/             # BullMQ consumer
├── packages/
│   ├── domains/              # move de src/domains
│   ├── shared/               # move de src/shared
│   ├── platform/             # auth partilhável
│   └── ui/                   # só web
└── prisma/
```

```
Browser → apps/web (Next)
              ↓ HTTP/JSON
       apps/api (Fastify) → packages/domains → prisma
              ↑
       apps/consumer ───────→ packages/domains
```

| O que permanece                    | O que muda                               |
| ---------------------------------- | ---------------------------------------- |
| `*.service` / repository / schemas | Vivem em `packages/domains`              |
| Contratos Zod / DTOs               | Validação nas rotas Fastify              |
| Jobs                               | Consumer igual; produce desde api ou web |
| Actions Next gordas                | Deixam de existir — web fala com Fastify |

**Não** criar `apps/api` vazio “por simetria”.  
**Não** um npm package por domínio no início do split.

---

## Migração

| Passo | O quê                                             | Estado                      |
| ----- | ------------------------------------------------- | --------------------------- |
| **A** | Layout fase 1 (`src/` + `consumer/`)              | ✅                          |
| **B** | Um `node_modules` na raiz; sem workspace monorepo | ✅                          |
| **C** | Redis ✅; 1 job real com `produce()`              | Redis ok; job real pendente |
| **D** | UI residual em `features/`; `index.ts` só se útil | concluído                   |
| **E** | Extrair `packages/*` + `apps/api` (fase 2)        | futuro                      |

---

## Não fazer

- Monorepo pnpm **só** por estética / “para o consumer”
- React dentro de `domains/`
- Hexagonal (`domain/application/infrastructure`) por contexto
- Fastify vazio antes de haver rotas reais
- Um package npm por bounded context no dia 1 do split

---

## Resumo

**Hoje:** `src/domains` (core) + `src/features` (UI) + `consumer/` — Next como BFF.  
**Depois:** o mesmo core em `packages/domains` + **Fastify** em `apps/api` + web só UI.
