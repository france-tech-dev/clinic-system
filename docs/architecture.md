# Arquitetura e regras do projecto — Clinic System

Documento de referência para a estrutura, camadas e boas práticas que seguimos neste repositório.

**Stack:** Next.js App Router · Server Actions · Prisma · Better Auth · Shadcn UI

**Abordagem:** monólito modular por feature — **não** DDD completo.

Documentos relacionados:

- Checklist de refactors: [`architecture-audit.md`](./architecture-audit.md)
- Roadmap funcional: [`ToDo.md`](./ToDo.md)
- Mensalidade Stripe: [`billing.md`](./billing.md)
- Media / R2: [`media-storage.md`](./media-storage.md)
- Jobs e filas (futuro): [`jobs-queues.md`](./jobs-queues.md)
- Regras para o Cursor (agente): [`.cursor/rules/`](../.cursor/rules/)

---

## 1. Por que esta arquitetura

Este projecto é um monólito Next.js multi-tenant (`Organization`) para gestão clínica de Terapia Ocupacional. A escala e complexidade justificam **organização por domínio**, mas **não** a cerimónia de DDD tático (aggregates, domain events, entidades ricas).

| Critério                   | Escolha                                     |
| -------------------------- | ------------------------------------------- |
| Organização                | Monólito modular por feature                |
| Camadas                    | repository → service → actions              |
| Modelo de dados            | Prisma + DTOs planos no boundary            |
| Orquestração multi-domínio | `app/` (pages), nunca feature → feature     |
| Testes                     | Vitest em funções puras e regras de negócio |

---

## 2. Estrutura de pastas

```
clinic-system/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── tests/                            # Testes (separados de src/)
│   ├── unit/                         # Vitest — unitários
│   │   ├── features/                 # espelha domínios de src/features/
│   │   ├── shared/
│   │   └── app/
│   ├── e2e/                          # Playwright — fluxos browser (futuro)
│   └── README.md
│
├── vitest.config.ts
│
└── src/
    ├── app/                          # Rotas (App Router)
    │   ├── (authenticated)/          # Área logada
    │   │   ├── _components/          # Shell partilhado (AppPage, etc.)
    │   │   ├── pacientes/
    │   │   │   ├── page.tsx            # Server Component — carrega dados
    │   │   │   ├── *-client.tsx        # Client Component — interacção
    │   │   │   ├── _components/        # UI só desta rota
    │   │   │   └── [id]/
    │   │   │       └── _components/hooks/
    │   │   ├── agenda/
    │   │   ├── caixa/
    │   │   └── ...
    │   ├── (not-authenticated)/
    │   └── api/                        # Só webhooks / HTTP externo
    │
    ├── features/                     # Fatias verticais por domínio
    │   ├── patient/
    │   │   ├── patient.repository.ts
    │   │   ├── patient.service.ts
    │   │   ├── patient.actions.ts
    │   │   ├── patient.schema.ts
    │   │   ├── patient.types.ts
    │   │   ├── components/           # UI usada em ≥2 rotas do domínio
    │   │   ├── hooks/
    │   │   └── _lib/                 # Helpers puros do domínio
    │   ├── schedule/
    │   ├── finance/
    │   ├── billing/           # mensalidade Stripe (trial + planos)
    │   ├── settings/
    │   └── dashboard/
    │
    ├── shared/                       # Kernel transversal (sem regra de negócio)
    │   ├── lib/                      # prisma, auth, org-context, utils
    │   ├── constants/                # paths, enums, categorias
    │   └── types/                    # ActionResult, tipos genéricos
    │
    ├── components/                   # UI genérica (shadcn, auth forms)
    │   ├── ui/
    │   ├── auth/
    │   └── templates/
    │
    ├── server/                       # Infra Better Auth (não é domínio clínico)
    │   ├── auth/
    │   └── organizations/
    │
    └── hooks/                        # Hooks globais (use-mobile, etc.)
```

### Fronteira `server/` vs `features/`

| Pasta           | Conteúdo                                   |
| --------------- | ------------------------------------------ |
| `src/server/`   | Sessão, convites, permissões Better Auth   |
| `src/features/` | Pacientes, agenda, caixa, relatórios, etc. |

Não mover lógica clínica para `server/`. Não mover auth para `features/`.

---

## 3. Camadas por feature

Cada domínio em `features/[nome]/` segue este padrão:

| Ficheiro               | Responsabilidade                                                                  |
| ---------------------- | --------------------------------------------------------------------------------- |
| `[nome].repository.ts` | Queries e mutações Prisma — **único sítio com `db`** na feature                   |
| `[nome].service.ts`    | Regras de negócio, mappers DTO — **sem** `'use server'`, **sem** `revalidatePath` |
| `[nome].schema.ts`     | Schemas Zod (validação de input)                                                  |
| `[nome].types.ts`      | DTOs planos (sem tipos Prisma no client)                                          |
| `[nome].actions.ts`    | Server Actions finas: validar → service → revalidar                               |
| `_lib/`                | Funções puras, agregações, helpers de domínio                                     |
| `components/`          | UI partilhada entre rotas **do mesmo domínio**                                    |
| `hooks/`               | Hooks partilhados entre rotas **do mesmo domínio**                                |

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
app/  →  features/  →  shared/
         ↓
    components/  (importa shared/; evitar features/)
```

| Origem        | Pode importar                         | Não pode importar          |
| ------------- | ------------------------------------- | -------------------------- |
| `app/`        | `features/`, `shared/`, `components/` | —                          |
| `features/`   | `shared/`                             | outras `features/`, `app/` |
| `shared/`     | outros módulos `shared/`              | `features/`, `app/`        |
| `components/` | `shared/`                             | `features/` (preferência)  |
| `server/`     | `shared/`                             | `features/`, `app/`        |

### Orquestração multi-domínio

Quando uma página precisa de dados de **várias features** (ex.: painel = dashboard + finance):

```tsx
// ✅ app/(authenticated)/painel/page.tsx
const [dashboard, cashflow] = await Promise.all([
  getDashboardData(organizationId),
  getCashflowPageData(organizationId),
]);
```

```tsx
// ❌ features/dashboard/dashboard.service.ts
import { getCashflowPageData } from "@/features/finance/finance.service";
```

### Verificação automática (`pnpm arch`)

As fronteiras acima são validadas por [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) (config em [`.dependency-cruiser.cjs`](../.dependency-cruiser.cjs)). Correm no `pnpm lint` e podem ser corridas isoladamente:

```bash
pnpm arch
```

Regras aplicadas (todas `error`):

- `no-cross-feature` — `features/*` não importa outra `features/*`
- `no-app-imports` — `features/`, `shared/`, `server/`, `components/` não importam `app/`
- `shared-no-features` — `shared/` não importa `features/`
- `server-no-features` — `server/` não importa `features/`
- `components-no-features` — `components/` não importa `features/`
- `no-circular` — sem dependências circulares em `src/`

Para quebrar ciclos: extrair tipos partilhados para um ficheiro próprio (ex.: `evaluation-form-types.ts`), separar leitura de dados da configuração, ou resolver metadados no boundary (ex.: `toAnamneseSummary(dto, label)` recebe o `label` do catálogo em vez de o service importar o registry).

Não há excepções activas às fronteiras. UI específica de uma rota fica no `_components/` local, mesmo quando consome actions de uma feature.

Partilhar dados finos entre domínios sem acoplar: usar tipos planos em `shared/types/` (ex.: `PatientOption` no diálogo de caixa em vez de `PatientDTO` de `features/patient`).

---

## 5. Onde colocar UI e hooks

Checklist **antes** de criar ficheiro em `app/.../_components/`:

1. Será usado **só nesta rota**? → `_components/` local
2. Outra rota do **mesmo domínio** precisa? → `features/[dominio]/components/` ou `hooks/`
3. **Várias features** precisam? → `shared/` ou `components/`

### Proibido

```tsx
// ❌ Import cruzado entre rotas
import { X } from "@/app/(authenticated)/caixa/_components/...";
```

### Exemplos neste projecto

| Componente                  | Destino                            |
| --------------------------- | ---------------------------------- |
| `CashTransactionFormDialog` | `features/finance/components/`     |
| `PatientPdfPreviewDialog`   | `features/patient/components/`     |
| `AppPage`                   | `app/(authenticated)/_components/` |
| `Button`, `Dialog`          | `components/ui/`                   |

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
4. Route Handlers (`app/api/`) só para webhooks e HTTP externo
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

## 11. Domínios actuais (`features/`)

| Feature     | Responsabilidade                                        |
| ----------- | ------------------------------------------------------- |
| `patient`   | Pacientes, ClinicalEvaluation, evoluções, PDF              |
| `anamnese`  | Anamnese por especialidade (hub, formulários, PDF)      |
| `guardian`  | Responsáveis, portal (Role.CLIENT), vínculo User        |
| `schedule`  | Agenda, agendamentos, calendário, repetição semanal     |
| `finance`   | Fluxo de caixa, lançamentos                             |
| `settings`  | Perfil profissional, branding da clínica                |
| `team`      | Profissionais da clínica                                |
| `dashboard` | Painel, estatísticas, alertas, busca global             |
| `protocol`  | ProtocolEvaluation (ex.: GMFM-88) + EvaluationModuleUI  |

---

## 12. Testes

Guia completo: [`tests/README.md`](../tests/README.md)

**Comandos:** `pnpm test` · `pnpm test:unit` · `pnpm test:watch` · `pnpm test:e2e` (Playwright, futuro)

| Tipo     | Pasta         | Ferramenta            |
| -------- | ------------- | --------------------- |
| Unitário | `tests/unit/` | Vitest                |
| E2E      | `tests/e2e/`  | Playwright (pendente) |

### Convenção unitários

- Código de produção em `src/`; testes em `tests/unit/`
- Espelhar domínio: `src/features/finance/_lib/build-summary.ts` → `tests/unit/features/finance/build-summary.test.ts`
- Imports via `@/` (aponta para `src/`)

### Prioridade

1. Funções puras em `_lib/` e `shared/lib/` — ✅ 28 testes
2. Regras em `*.service.ts` (mock repository)
3. E2E nos fluxos críticos (login, paciente, agenda, caixa)

**Não** colocar `*.test.ts` dentro de `src/`. **Não** testar primeiro: actions com `revalidatePath`, shadcn, PDF.

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
6. Precisa de dados de outra feature? Orquestrar em `app/`, não importar feature → feature
7. Mutations: Zod na action, regra no service, Prisma no repository
8. Testar no browser após mudanças em UI ou backend crítico

---

## 16. O que evitar

| Abordagem                           | Por quê                                      |
| ----------------------------------- | -------------------------------------------- |
| DDD completo (aggregates, events)   | Overhead desproporcional para este projecto  |
| Microserviços                       | Um deploy, uma DB, equipa pequena            |
| Hexagonal em todo o código          | Mappers duplicados sem ganho com Prisma      |
| Import entre `features/`            | Acoplamento; orquestrar em `app/`            |
| Import entre rotas (`_components/`) | Quebra isolamento de UI                      |
| `db` directo em services            | Viola camada repository                      |
| Clean Architecture dogmática        | App Router já resolve boundary server/client |

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
