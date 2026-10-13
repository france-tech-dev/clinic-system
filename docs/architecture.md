# Arquitetura — Clinic System

Referência humana da estrutura e camadas. Regras de código do agente: [`.cursor/rules/`](../.cursor/rules/).

**Stack:** Next.js App Router · Server Actions · Prisma · Better Auth · Shadcn UI · BullMQ (`consumer/`)

**Abordagem:** monólito modular por domínio em `src/` + `consumer/` — **não** DDD tático.  
**Estado:** fase 1. Split futuro (Fastify): [`target-structure.md`](./target-structure.md).

Índice: [`README.md`](./README.md) · contextos: [`bounded-contexts.md`](./bounded-contexts.md) · roadmap: [`ToDo.md`](./ToDo.md)

---

## 1. Porquê

Monólito Next multi-tenant (`Organization`) para gestão clínica de T.O. Organização por domínio sim; cerimónia de aggregates / domain events não.

| Critério                   | Escolha                                           |
| -------------------------- | ------------------------------------------------- |
| Organização                | Monólito modular (web + consumer)                 |
| Camadas                    | repository → service → actions                    |
| Modelo                     | Prisma + DTOs planos no boundary                  |
| Orquestração multi-domínio | `app/` (pages); escrita composta → `application/` |
| Testes                     | Vitest em funções puras e regras de negócio       |

---

## 2. Estrutura (fase 1 — canónica)

```
clinic-system/
├── src/
│   ├── app/                 # Rotas + _components de 1 página
│   │   ├── (authenticated)/
│   │   ├── (not-authenticated)/
│   │   └── api/             # Webhooks / HTTP externo / stream IA
│   ├── features/            # UI (+ hooks) por domínio (≥2 rotas)
│   ├── domains/             # Negócio (repo / service / actions)
│   ├── application/         # Orquestrações ≥2 domains (hoje: patient)
│   ├── platform/            # Auth, org (alias @/server)
│   ├── shared/              # prisma, jobs, ai, media, env
│   ├── ui/                  # Design system (alias @/components)
│   ├── resources/           # Dados de UI estáticos (ex. sidebar)
│   ├── hooks/               # Hooks globais (ex. use-mobile)
│   └── proxy.ts
├── consumer/                # BullMQ Worker (tsx; não é package npm)
├── prisma/
├── tests/
│   ├── unit/                # espelha domains|features|shared|app
│   └── e2e/
└── package.json
```

### Aliases

| Alias            | Destino          |
| ---------------- | ---------------- |
| `@/domains/*`    | `src/domains/*`  |
| `@/features/*`   | `src/features/*` |
| `@/shared/*`     | `src/shared/*`   |
| `@/server/*`     | `src/platform/*` |
| `@/components/*` | `src/ui/*`       |
| `@/*`            | `src/*`          |

### Fronteiras

| Pasta           | Alias           | Conteúdo                            |
| --------------- | --------------- | ----------------------------------- |
| `src/platform/` | `@/server/`     | Sessão, convites, gates Better Auth |
| `src/domains/`  | `@/domains/`    | Regras clínicas + actions finas     |
| `src/features/` | `@/features/`   | UI/hooks por domínio (≥2 rotas)     |
| `src/ui/`       | `@/components/` | Design system sem regra de negócio  |

Não mover lógica clínica para platform. Não meter React em `domains/`.

---

## 3. Camadas por domínio

Em `src/domains/[nome]/`:

| Ficheiro               | Papel                                                                        |
| ---------------------- | ---------------------------------------------------------------------------- |
| `[nome].repository.ts` | Único sítio com `db`                                                         |
| `[nome].service.ts`    | Regras — sem `'use server'`, sem `revalidatePath`                            |
| `[nome].schema.ts`     | Zod                                                                          |
| `[nome].types.ts`      | DTOs planos                                                                  |
| `[nome].actions.ts`    | Validar → service → revalidar (opcional se a escrita for via `application/`) |
| `_lib/`                | Helpers puros                                                                |
| `jobs/`                | Handlers BullMQ (opcional)                                                   |

`index.ts` (API pública sem exportar repository) só com consumidores reais.

**Fluxo mutação:** Client → action (Zod) → service → repository → revalidate.  
**Fluxo leitura:** `page.tsx` → service → repository → props ao client.

**Nota:** mutações de `guardian` passam por `application/patient` (create/update composto) — não há `guardian.actions.ts` obrigatório.

**PDF:** payload/DTO em `domains/` ou `application/`; renderer React-PDF em `features/` ou `shared/lib/pdf`; shell de rota em `app/.../pdf`.

---

## 4. Dependências

```
app/          →  domains/  →  shared/
              →  features/ →  domains / shared
              →  application/ (≥2 domains)
ui/           →  shared/
platform/     →  shared/
consumer/     →  domains/, shared/
```

| Origem         | Pode importar                                      | Não pode                           |
| -------------- | -------------------------------------------------- | ---------------------------------- |
| `app/`         | domains, features, application, shared, ui, server | —                                  |
| `application/` | domains, shared, server                            | features, app, ui                  |
| `domains/`     | shared, server                                     | outros contexts profundos, app, ui |
| `features/`    | domains, shared, ui                                | `_components/` de outra rota       |
| `shared/`      | shared                                             | domains, app                       |
| `ui/`          | shared                                             | domains (preferência)              |
| `platform/`    | shared                                             | domains, app                       |

Cruzar contextos: compor em `app/` (`Promise.all` de services) ou escrita estável em `application/` (hoje só `patient/`).

### `pnpm arch`

Fronteiras validadas por dependency-cruiser ([`.dependency-cruiser.cjs`](../.dependency-cruiser.cjs)): `no-cross-feature`, `no-app-imports`, `shared-no-features`, `server-no-features`, `components-no-features`, `no-circular`. Correm no `pnpm lint` e isoladas com `pnpm arch`.

Tipos finos partilhados: `shared/types/` (ex. `PatientOption`) em vez de importar DTOs de outro domínio.

---

## 5. Onde colocar UI

1. Só nesta rota? → `app/.../_components/`
2. ≥2 rotas do mesmo domínio? → `features/[domínio]/`
3. Genérico sem negócio? → `ui/` (`@/components`)

Proibido importar `_components/` de outra rota.

---

## 6. Server → Client

Não passar `Decimal`, `Date` nem modelos Prisma a Client Components. DTOs planos (`*.types.ts`): datas ISO, dinheiro em centavos.

---

## 7. Server Actions (resumo)

Tipo: `ActionResult` em `shared/types/action-result.ts`.  
Validar com Zod (`AppError.parse`); action fina → service → revalidate; catch → `AppError.result`.  
`app/api/` só webhooks, HTTP externo e stream IA — [`ai.md`](./ai.md).

Detalhe: `.cursor/rules/nextjs-server-actions.mdc`.

---

## 8. React, páginas, UX, YAGNI

| Tema                  | Onde está a regra                                |
| --------------------- | ------------------------------------------------ |
| Dados / `useEffect`   | `.cursor/rules/react-effects-and-data.mdc`       |
| `AppPage` / shell     | `.cursor/rules/app-page.mdc`                     |
| UX / tokens / dialogs | `.cursor/rules/ux.mdc`, `frontend.mdc`           |
| YAGNI / fecho         | `.cursor/rules/ponytail.mdc`, `project-core.mdc` |

---

## 9. Domínios (`src/domains`)

| Domínio      | Responsabilidade                                |
| ------------ | ----------------------------------------------- |
| `patient`    | Pacientes, cadastro, PDF prontuário (orquestra) |
| `assessment` | Avaliação clínica do prontuário                 |
| `evolution`  | Nota por atendimento                            |
| `anamnese`   | Anamnese por especialidade                      |
| `guardian`   | Responsáveis, portal (Role.CLIENT)              |
| `schedule`   | Agenda, repetição semanal                       |
| `finance`    | Fluxo de caixa                                  |
| `settings`   | Perfil profissional, branding                   |
| `team`       | Profissionais da clínica                        |
| `dashboard`  | Painel, estatísticas                            |
| `protocol`   | Instrumentos pontuados + interpretação IA       |
| `billing`    | Mensalidade Stripe (trial + planos)             |

Mapa estratégico: [`bounded-contexts.md`](./bounded-contexts.md).

---

## 10. Testes

Guia: [`tests/README.md`](../tests/README.md).  
Unitários em `tests/unit/` espelhando `domains` / `features` / `shared` / `app`. Sem `*.test.ts` dentro de `src/` ou `consumer/`. Prioridade: `_lib/` puro → services → E2E críticos.

---

## 11. O que evitar

| Abordagem                          | Porquê                                      |
| ---------------------------------- | ------------------------------------------- |
| DDD completo / hexagonal dogmático | Overhead sem ganho com Prisma + App Router  |
| Microserviços agora                | Um deploy, uma DB                           |
| Import profundo entre `domains/`   | Orquestrar em `app/`                        |
| Import entre rotas `_components/`  | Quebra isolamento de UI                     |
| `db` em services                   | Vai no repository                           |
| React em `domains/`                | Consumer/API não devem puxar React          |
| Monorepo `apps/`+`packages/` agora | Fase 1 é `src/`+`consumer/`; Fastify depois |

Notas estáveis: `application/` só `patient` — não expandir sem 2.º caso real. Jobs: infra pronta, `produce()` sem callers — [`jobs-queues.md`](./jobs-queues.md).
