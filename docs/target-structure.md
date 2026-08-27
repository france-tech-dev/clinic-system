# Estrutura-alvo — hoje `src/` → depois Fastify

**Decisão (actualizada):** até existir API Fastify, o alvo é **um app Next na raiz** com pastas claras em `src/` + `worker/` — **sem** monorepo pnpm (`apps/` + `packages/`) como objectivo imediato.

Complementa [`architecture.md`](./architecture.md), [`bounded-contexts.md`](./bounded-contexts.md) e [`jobs-queues.md`](./jobs-queues.md).

**Porquê:** o split real é **Next (UI) ↔ Fastify (HTTP)**. Packages npm só compensam quando há ≥2 processos a partilhar o mesmo código de negócio (web + api + worker). Até lá, symlinks `@clinic/*` aumentam ruído sem ganho.

**Estado do repositório:** fase 1 aplicada (`src/` + `worker/`). Monorepo `apps/`+`packages/` removido até existir Fastify.

---

## Fase 1 — Hoje (preparado para Fastify)

```
clinic-system/
├── src/
│   ├── app/                      # Next — rotas + _components de 1 página
│   │   └── api/                  # BFF temporário: auth, stripe, stream IA
│   ├── features/                 # UI (+ hooks) por domínio — sem Prisma / sem regras
│   │   ├── patient/
│   │   ├── protocol/
│   │   └── …
│   ├── domains/                  # ★ negócio server-only (o futuro core do Fastify)
│   │   ├── patient/
│   │   ├── schedule/
│   │   ├── finance/
│   │   ├── protocol/
│   │   └── …
│   ├── application/              # orquestrações ≥2 domains (opcional)
│   ├── platform/                 # auth, org, gates (ex-server/)
│   ├── shared/                   # prisma, jobs/, ai, media, env, types
│   ├── ui/                       # design system (ex-components/)
│   └── proxy.ts
├── worker/
│   └── index.ts                  # BullMQ → domains (tsx; não é package npm)
├── prisma/
└── package.json                  # scripts: dev, worker, test, arch
```

### Responsabilidades

| Pasta             | O quê                                                      | Não meter                         |
| ----------------- | ---------------------------------------------------------- | --------------------------------- |
| `src/app`         | Rotas, composition, adaptadores (actions / route handlers) | Regras de negócio, Prisma directo |
| `src/features`    | UI/hooks por domínio (≥2 rotas)                            | `db`, services                    |
| `src/domains`     | repository, service, schema, types, jobs                   | React, Next                       |
| `src/application` | Casos de uso multi-domínio                                 | UI                                |
| `src/platform`    | Sessão, membership, platform admin                         | Clínica                           |
| `src/shared`      | Infra transversal                                          | Services clínicos                 |
| `src/ui`          | Shadcn / shell sem regra de negócio                        | PatientDTO                        |
| `worker/`         | Processo de filas                                          | React / App Router                |

### Domains = server-only

```
UI / Action / (futuro) Fastify route  →  domain.service  →  repository
         ↑ fino                              ↑ dono da regra
```

| Situação                  | Destino                        |
| ------------------------- | ------------------------------ |
| 1 rota                    | `src/app/.../_components/`     |
| ≥2 rotas do mesmo domínio | `src/features/[domínio]/`      |
| Genérico                  | `src/ui/`                      |
| Negócio                   | `src/domains/` — **sem** React |

Interior de um contexto:

```
src/domains/patient/
├── index.ts                 # API pública (sem repository)
├── patient.types.ts
├── patient.schema.ts
├── patient.repository.ts
├── patient.service.ts       # sem 'use server', sem next/react
├── patient.actions.ts       # fino (Zod → service → revalidate) — adaptador Next
├── lib/
└── jobs/                    # handlers BullMQ
```

Actions podem ficar junto do domain **ou** em `src/app` como adaptadores; o service **nunca** importa Next/React.

### Worker (fase 1)

```json
"worker": "tsx worker/index.ts"
```

Filas em `src/shared/lib/jobs`; handlers em `src/domains/.../jobs`.  
Sem `REDIS_URL` → idle / no-op (dev).

---

## Fase 2 — Depois (Fastify + monorepo leve)

Só quando a API HTTP for produto real:

```
clinic-system/
├── apps/
│   ├── web/                  # Next — UI; consome HTTP
│   ├── api/                  # ★ Fastify — rotas → packages/domains
│   └── worker/               # BullMQ
├── packages/
│   ├── domains/              # move de src/domains (mesmo código)
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
       apps/worker ───────→ packages/domains
```

| O que permanece igual              | O que muda                               |
| ---------------------------------- | ---------------------------------------- |
| `*.service` / repository / schemas | Vivem em `packages/domains`              |
| Contratos Zod / DTOs               | Validação nas rotas Fastify              |
| Jobs                               | Worker igual; enqueue desde api ou web   |
| Actions Next gordas                | Deixam de existir — web fala com Fastify |

**Não** criar `apps/api` vazio “por simetria”.  
**Não** um npm package por domínio (`domain-patient`, …) no início do split.

---

## Dependências (fase 1)

```
app, features, application  →  domains, platform, shared, ui
worker                      →  domains, shared  (+ platform se precisar)
domains                     →  shared, platform?
                               NÃO → features, ui, app
platform                    →  shared
ui                          →  shared (utils)
shared                      →  deps npm
```

Cruzar contexts: `application/` ou `domains/X/index.ts` (DAG; sem imports profundos de repository alheio).

---

## Migração recomendada (a partir do monorepo experimental)

| Passo | O quê                                                                                                          | Estado   |
| ----- | -------------------------------------------------------------------------------------------------------------- | -------- |
| **A** | Reverter layout para fase 1 (`src/domains`, `src/features`, `src/shared`, `src/platform`, `src/ui`, `worker/`) | ✅       |
| **B** | Um `node_modules` na raiz; sem workspace `apps/*` + `packages/*`                                               | ✅       |
| **C** | Redis + 1 job real                                                                                             | pendente |
| **D** | `index.ts` por domain; UI residual movida para `src/features` (protocol, anamnese, PDF) | concluído |
| **E** | Quando Fastify: extrair `packages/*` + `apps/api` (fase 2)                                                     | futuro   |

---

## Não fazer

- Monorepo pnpm **só** por estética / “para o worker” (worker na raiz basta)
- React dentro de `domains/`
- Hexagonal (`domain/application/infrastructure`) por contexto
- Fastify vazio antes de haver rotas reais
- Um package npm por bounded context no dia 1 do split

---

## Resumo

**Hoje:** `src/domains` (core) + `src/features` (UI) + `worker/` — Next como BFF.  
**Depois:** o mesmo core em `packages/domains` + **Fastify** em `apps/api` + web só UI.
