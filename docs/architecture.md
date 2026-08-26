# Arquitetura e regras do projecto — Clinic System

Documento de referência para a estrutura, camadas e boas práticas que seguimos neste repositório.

**Stack:** Next.js App Router · Server Actions · Prisma · Better Auth · Shadcn UI

**Abordagem:** monólito modular por domínio em `src/` + `worker/` — **não** DDD completo.  
**Estado:** fase 1 aplicada (`src/` + `worker/`). Split futuro: **Fastify** como API — ver [`target-structure.md`](./target-structure.md).

Documentos relacionados:

- Bounded contexts (DDD estratégico): [`bounded-contexts.md`](./bounded-contexts.md)
- Estrutura-alvo (hoje `src/` → Fastify): [`target-structure.md`](./target-structure.md)
- Checklist de refactors: [`architecture-audit.md`](./architecture-audit.md)
- Roadmap funcional: [`ToDo.md`](./ToDo.md)
- Mensalidade Stripe: [`billing.md`](./billing.md)
- Media / R2: [`media-storage.md`](./media-storage.md)
- Jobs e filas: [`jobs-queues.md`](./jobs-queues.md)
- Regras para o Cursor (agente): [`.cursor/rules/`](../.cursor/rules/)

---

## 1. Por que esta arquitetura

Este projecto é um monólito Next.js multi-tenant (`Organization`) para gestão clínica de Terapia Ocupacional, organizado por domínio em `src/`. A escala e complexidade justificam **organização por domínio**, mas **não** a cerimónia de DDD tático (aggregates, domain events, entidades ricas).

| Critério                   | Escolha                                     |
| -------------------------- | ------------------------------------------- |
| Organização                | Monólito modular por domínio (web + worker) |
| Camadas                    | repository → service → actions              |
| Modelo de dados            | Prisma + DTOs planos no boundary            |
| Orquestração multi-domínio | `app/` (pages), nunca domínio → domínio     |
| Testes                     | Vitest em funções puras e regras de negócio |

---

## 2. Estrutura de pastas

Layout físico actual (fase 1). Aliases em `tsconfig` (ver abaixo). Evolução para Fastify: [`target-structure.md`](./target-structure.md).

```
clinic-system/
├── src/
│   ├── app/                          # Rotas (App Router) + _components de 1 rota
│   │   ├── (authenticated)/          # Área logada
│   │   ├── (not-authenticated)/
│   │   └── api/                      # Só webhooks / HTTP externo
│   ├── features/                     # UI (+ hooks) por domínio — sem Prisma
│   │   ├── patient/components|hooks/
│   │   └── …
│   ├── domains/                      # Negócio (repo / service / actions)
│   │   ├── patient/
│   │   ├── schedule/
│   │   ├── finance/
│   │   ├── billing/
│   │   └── …
│   ├── shared/                       # Infra (prisma, jobs, ai, …)
│   ├── platform/                     # Auth, org (alias @/server)
│   ├── ui/                           # Design system (shadcn, shell)
│   ├── hooks/                        # Hooks globais (use-mobile, etc.)
│   └── proxy.ts
│
├── worker/                           # BullMQ (tsx; não é package npm)
│   └── index.ts
│
├── prisma/
├── tests/                            # Vitest / Playwright
│   ├── unit/                         # espelha domínios (pasta features/ histórica)
│   └── e2e/
└── package.json
```

### Aliases TypeScript

| Alias            | Destino físico    |
| ---------------- | ----------------- |
| `@/domains/*`    | `src/domains/*`   |
| `@/shared/*`     | `src/shared/*`    |
| `@/server/*`     | `src/platform/*`  |
| `@/components/*` | `src/ui/*`        |
| `@/features/*`   | `src/features/*`  |
| `@/*`            | `src/*`           |

Imports de negócio preferem `@/domains/…`. O alias `@/server/*` continua a apontar para platform.

### Fronteira platform vs domains vs UI web

| Pasta física     | Alias           | Conteúdo                                        |
| ---------------- | --------------- | ----------------------------------------------- |
| `src/platform/`  | `@/server/`     | Sessão, convites, permissões Better Auth        |
| `src/domains/`   | `@/domains/`    | Pacientes, agenda, caixa, regras, actions finas |
| `src/features/`  | `@/features/`   | Componentes/hooks UI por domínio (≥2 rotas)     |
| `src/ui/`        | `@/components/` | Design system sem regra de negócio              |

Não mover lógica clínica para platform. Não meter React/UI de produto em `src/domains`.

---

## 3. Camadas por domínio

Cada contexto em `src/domains/[nome]/` (import `@/domains/[nome]/`) segue este padrão:

| Ficheiro                  | Responsabilidade                                                                  |
| ------------------------- | --------------------------------------------------------------------------------- |
| `[nome].repository.ts`    | Queries e mutações Prisma — **único sítio com `db`** no domínio                   |
| `[nome].service.ts`       | Regras de negócio, mappers DTO — **sem** `'use server'`, **sem** `revalidatePath` |
| `[nome].schema.ts`        | Schemas Zod (validação de input)                                                  |
| `[nome].types.ts`         | DTOs planos (sem tipos Prisma no client)                                          |
| `[nome].actions.ts`       | Server Actions finas: validar → service → revalidar                               |
| `_lib/` / `lib/`          | Funções puras, agregações, helpers de domínio                                     |
| UI `components/`/`hooks/` | Em `src/features/[nome]/` (≥2 rotas do mesmo domínio)                             |

### Fluxo de uma mutação

```
Client (handler) → action (Zod) → service (regra) → repository (Prisma)
                         ↓
                  revalidatePath / revalidateTag
```

### Fluxo de leitura (preferido)

```
page.tsx (Server Component) → service → repository
         ↓
    *-client.tsx (props iniciais)
```

---

## 4. Regras de dependência

```
app/  →  domains/  →  shared/
      →  features/ (UI web) → domains / shared
components/ (ui)  →  shared/   (evitar domains/)
platform/         →  shared/
```

| Origem (conceito / pasta)     | Pode importar                                                     | Não pode importar                     |
| ----------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| `src/app/`                    | `@/domains`, `@/features`, `@/shared`, `@/components`, `@/server` | —                                     |
| `src/domains`                 | `@/shared`, `@/server` (platform)                                 | outros contexts profundos, `app/`, ui |
| `src/features/` (UI)          | `@/domains`, `@/shared`, `@/components`                           | UI de outra rota `_components/`       |
| `src/shared`                  | outros módulos `shared/`                                          | `domains/`, `app/`                    |
| `src/ui` (`@/components`)     | `@/shared` (utils)                                                | `domains/` (preferência)              |
| `src/platform` (`@/server`)   | `@/shared`                                                        | `domains/`, `app/`                    |

### Orquestração multi-domínio

Quando uma página precisa de dados de **vários domains** (ex.: painel = dashboard + finance):

```tsx
// ✅ src/app/(authenticated)/painel/page.tsx
const [dashboard, cashflow] = await Promise.all([
  getDashboardData(organizationId),
  getCashflowPageData(organizationId),
]);
```

```tsx
// ❌ src/domains/dashboard/dashboard.service.ts
import { getCashflowPageData } from "@/domains/finance/finance.service";
```

### Verificação automática (`pnpm arch`)

As fronteiras acima são validadas por [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) (config em [`.dependency-cruiser.cjs`](../.dependency-cruiser.cjs)). Correm no `pnpm lint` e podem ser corridas isoladamente:

```bash
pnpm arch
```

Regras aplicadas (todas `error`):

- `no-cross-feature` — contexts em `domains/*` não importam outro context em profundidade (evoluir para API pública / DAG — ver target-structure)
- `no-app-imports` — `domains/`, `shared/`, `platform/`, `ui/` não importam `app/`
- `shared-no-features` — `shared/` não importa `domains/`
- `server-no-features` — `platform/` (`@/server`) não importa `domains/`
- `components-no-features` — `ui/` não importa `domains/`
- `no-circular` — sem dependências circulares em `src/`

Para quebrar ciclos: extrair tipos partilhados para um ficheiro próprio (ex.: `evaluation-form-types.ts`), separar leitura de dados da configuração, ou resolver metadados no boundary (ex.: `toAnamneseSummary(dto, label)` recebe o `label` do catálogo em vez de o service importar o registry).

Não há excepções activas às fronteiras. UI específica de uma rota fica no `_components/` local, mesmo quando consome actions de um domínio.

Partilhar dados finos entre domínios sem acoplar: usar tipos planos em `shared/types/` (ex.: `PatientOption` no diálogo de caixa em vez de `PatientDTO` de `domains/patient`).

---

## 5. Onde colocar UI e hooks

Checklist **antes** de criar ficheiro em `src/app/.../_components/`:

1. Será usado **só nesta rota**? → `_components/` local
2. Outra rota do **mesmo domínio** precisa? → `src/features/[domínio]/components/` ou `hooks/` (`@/features/…`)
3. **Vários domains** precisam? → `shared/` ou `src/ui` (`@/components`)

### Proibido

```tsx
// ❌ Import cruzado entre rotas
import { X } from "@/app/(authenticated)/caixa/_components/...";
```

### Exemplos neste projecto

| Componente                  | Destino                                    |
| --------------------------- | ------------------------------------------ |
| `CashTransactionFormDialog` | `src/features/finance/components/`         |
| `PatientPdfPreviewDialog`   | `src/features/patient/components/`         |
| `AppPage`                   | `src/app/(authenticated)/_components/`     |
| `Button`, `Dialog`          | `src/ui` (`@/components/ui/`)              |

---

## 6. Server → Client boundary

- **Não** passar `Decimal`, `Date` nem modelos Prisma completos a Client Components
- Usar DTOs planos em `*.types.ts` (datas como ISO string, valores monetários em centavos)
- Lógica de negócio e Prisma ficam no servidor

```ts
// ✅ patient.types.ts
export type PatientDTO = {
  id: string;
  name: string;
  createdAt: string; // ISO
  priceCents: number | null;
};
```

---

## 7. Server Actions

Retorno padrão (`shared/types/action-result.ts`):

```ts
export type ActionResult<T = void> =
  { success: true; data: T } | { success: false; error: string };
```

Regras:

1. Validar com **Zod** (`safeParse`) — nunca confiar só no cliente
2. Actions **finas**: validar → chamar service → `revalidatePath` / `revalidateTag`
3. Segredos só no servidor (env)
4. Route Handlers (`app/api/`) só para webhooks, HTTP externo e **streaming de IA** (ex. `/api/ai/*`) — ver [`docs/ai.md`](ai.md)
5. Manter **nomes exportados** estáveis ao refatorar

Cliente:

- Formulários: `useActionState` + `<form action={formAction}>`
- Botões: `useTransition` + chamada directa à action

---

## 8. React — dados e efeitos

- **Server Component primeiro** — buscar em `page.tsx` e passar props ao client
- **Query string** — resolver no servidor; passar `initial*` ao client
- **Client** — buscar só em event handlers via Server Actions + `useTransition`
- **`useEffect`** — só para sistemas externos (listeners, timers, libs de terceiros)
- **Não** usar effect para fetch inicial, espelhar props em state, ou derivar estado de props

Ver também: `.cursor/rules/react-effects-and-data.mdc`

---

## 9. SOLID (versão pragmática)

Aplicamos SOLID onde traz valor, sem cerimónia enterprise.

| Princípio                     | Como aplicamos                                                               |
| ----------------------------- | ---------------------------------------------------------------------------- |
| **S** — Single Responsibility | Actions finas; repository = dados; service = regras; `_lib/` = helpers puros |
| **O** — Open/Closed           | Estender service/repository existente antes de criar caminho paralelo        |
| **L** — Liskov                | Pouco relevante (sem hierarquias de classes)                                 |
| **I** — Interface Segregation | DTOs e schemas Zod focados por operação                                      |
| **D** — Dependency Inversion  | `app/` depende de abstracções (services); Prisma isolado nos repositories    |

---

## 10. Clean code

| Prática     | Regra                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Nomes       | Verbos para funções (`listPatients`, `buildSummary`); substantivos para tipos    |
| Funções     | Pequenas; uma responsabilidade; extrair para `_lib/` quando reutilizável         |
| Ficheiros   | Partir quando passar **~300–400 linhas** (excluir shadcn e constantes estáticas) |
| Duplicação  | Procurar em `shared/` e `_lib/` antes de criar — ver `reuse-before-create.mdc`   |
| Comentários | Só para lógica de negócio não óbvia                                              |
| Abstrações  | Criar quando houver **≥2 usos reais**, não para hipóteses futuras                |

---

## 11. Domínios actuais (`src/domains`)

| Domínio     | Responsabilidade                                       |
| ----------- | ------------------------------------------------------ |
| `patient`   | Pacientes, ClinicalEvaluation, evoluções, PDF          |
| `anamnese`  | Anamnese por especialidade (hub, formulários, PDF)     |
| `guardian`  | Responsáveis, portal (Role.CLIENT), vínculo User       |
| `schedule`  | Agenda, agendamentos, calendário, repetição semanal    |
| `finance`   | Fluxo de caixa, lançamentos                            |
| `settings`  | Perfil profissional, branding da clínica               |
| `team`      | Profissionais da clínica                               |
| `dashboard` | Painel, estatísticas, alertas                          |
| `protocol`  | ProtocolEvaluation (ex.: GMFM-88) + EvaluationModuleUI |
| `billing`   | Mensalidade Stripe (trial + planos)                    |

---

## 12. Testes

Guia completo: [`tests/README.md`](../tests/README.md)

**Comandos:** `pnpm test` · `pnpm test:unit` · `pnpm test:watch` · `pnpm test:e2e` (Playwright, futuro)

| Tipo     | Pasta         | Ferramenta            |
| -------- | ------------- | --------------------- |
| Unitário | `tests/unit/` | Vitest                |
| E2E      | `tests/e2e/`  | Playwright (pendente) |

### Convenção unitários

- Código de produção em `src/` (+ `worker/`); testes em `tests/unit/`
- Espelhar domínio: `src/domains/finance/_lib/build-summary.ts` → `tests/unit/features/finance/build-summary.test.ts`
- Imports via aliases (`@/domains/…`, `@/shared/…`, …)

### Prioridade

1. Funções puras em `_lib/` e `shared/lib/` — ✅ 28 testes
2. Regras em `*.service.ts` (mock repository)
3. E2E nos fluxos críticos (login, paciente, agenda, caixa)

**Não** colocar `*.test.ts` dentro de `src/` ou `worker/`. **Não** testar primeiro: actions com `revalidatePath`, shadcn, PDF.

---

## 13. Páginas autenticadas

- Usar `AppPage` em vez de repetir `SiteHeader` + padding
- Client components (`*-client.tsx`) **sem** shell de página
- Ver: `.cursor/rules/app-page.mdc`

---

## 14. UX e design system

- Tokens semânticos (`bg-background`, `text-muted-foreground`) — não cores fixas
- Altura viewport: **`dvh`**, não `vh` (mobile)
- Deletes destrutivos: `DeleteConfirmDialog`
- Ver: `.cursor/rules/ux.mdc`, `.cursor/rules/frontend.mdc`

---

## 15. Checklist rápido (nova funcionalidade)

1. Existe feature semelhante? Copiar o padrão (nomes, pastas, exports)
2. Onde fica o ficheiro? (secção 5 — UI; secção 2 — camadas)
3. Dá para buscar no Server Component? Fazer lá
4. Precisa de `useEffect`? Só se for sistema externo
5. Vai passar de 300 linhas? Planear split em `_lib/` ou sub-componentes
6. Precisa de dados de outro domínio? Orquestrar em `app/`, não importar domain → domain
7. Mutations: Zod na action, regra no service, Prisma no repository
8. Testar no browser após mudanças em UI ou backend crítico

---

## 16. O que evitar

| Abordagem                           | Por quê                                        |
| ----------------------------------- | ---------------------------------------------- |
| DDD completo (aggregates, events)   | Overhead desproporcional para este projecto    |
| Microserviços                       | Um deploy, uma DB, equipa pequena              |
| Hexagonal em todo o código          | Mappers duplicados sem ganho com Prisma        |
| Import profundo entre `domains/`    | Acoplamento; orquestrar em `app/`              |
| Import entre rotas (`_components/`) | Quebra isolamento de UI                        |
| `db` directo em services            | Viola camada repository                        |
| Clean Architecture dogmática        | App Router já resolve boundary server/client   |
| React/UI em `src/domains`           | Worker/api não devem puxar React (ver UI-DEBT) |
| Monorepo `apps/`+`packages/` agora  | Fase 1 é `src/`+`worker/`; Fastify depois      |

---

## 17. Referência de rules Cursor

| Área                      | Ficheiro                     |
| ------------------------- | ---------------------------- |
| Core (sempre activo)      | `project-core.mdc`           |
| Server Actions            | `nextjs-server-actions.mdc`  |
| UI partilhada             | `route-shared-ui.mdc`        |
| Reutilizar antes de criar | `reuse-before-create.mdc`    |
| React / efeitos           | `react-effects-and-data.mdc` |
| Páginas autenticadas      | `app-page.mdc`               |
| Frontend                  | `frontend.mdc`               |
| UX / design               | `ux.mdc`                     |
| Testes / validação        | `testing.mdc`                |
