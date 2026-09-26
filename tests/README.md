# Testes — Clinic System

Estrutura separada do código de produção (`src/`).

```
tests/
├── unit/          # Vitest — funções puras, services (mock repository)
├── e2e/           # Playwright — fluxos no browser (futuro)
├── load/          # k6 — smoke / carga / stress (alvo: staging Dokploy)
└── README.md      # este arquivo
```

## Comandos

| Comando                 | O quê                                         |
| ----------------------- | --------------------------------------------- |
| `pnpm test`             | Todos os unitários (Vitest)                   |
| `pnpm test:unit`        | Idem                                          |
| `pnpm test:watch`       | Vitest em modo watch                          |
| `pnpm test:e2e`         | E2E Playwright (quando configurado)           |
| `pnpm test:load:smoke`  | k6 smoke (~30s) — requer `BASE_URL` (staging) |
| `pnpm test:load`        | k6 carga média                                |
| `pnpm test:load:stress` | k6 stress — observar CPU/RAM no Dokploy       |

## Onde colocar cada tipo

| Tipo                   | Pasta            | Ferramenta | Exemplo                                                        |
| ---------------------- | ---------------- | ---------- | -------------------------------------------------------------- |
| **Unitário**           | `tests/unit/`    | Vitest     | `tests/unit/features/finance/build-summary.test.ts`            |
| **E2E**                | `tests/e2e/`     | Playwright | `tests/e2e/agenda.spec.ts`                                     |
| **Carga**              | `tests/load/`    | k6         | `tests/load/smoke.js` — ver [`load/README.md`](load/README.md) |
| **Fixtures / helpers** | `tests/helpers/` | —          | dados partilhados entre testes                                 |

### Convenção unitários

Espelhar o domínio de `src/`, **sem** copiar `_lib/` no path quando o arquivo testado é óbvio:

```
src/features/finance/_lib/build-summary.ts
→ tests/unit/features/finance/build-summary.test.ts
```

Imports sempre via alias `@/` apontando para `src/`:

```ts
import { buildSummary } from "@/features/finance/_lib/build-summary";
```

### O que testar primeiro (unitário)

1. Funções puras em `features/*/_lib/` e `shared/lib/`
2. Regras de negócio em `*.service.ts` (mock do repository)
3. Helpers de UI só se forem funções puras exportadas

### O que **não** testar em unitário

- Server Actions com `revalidatePath` (mock pesado)
- Componentes shadcn / snapshots de PDF
- Fluxos completos de auth (→ E2E)

## E2E (Playwright)

Pasta reservada em `tests/e2e/`. Candidatos quando ativarmos:

- Login + seleção de organização
- CRUD paciente
- Agenda: criar agendamento, marcar realizado
- Caixa: lançamento de entrada

Ver `tests/e2e/README.md`.

## Carga (k6)

Alvo: **staging Dokploy** (`BASE_URL`). Nunca produção. Detalhes, thresholds e checklist do environment: [`load/README.md`](load/README.md).

```bash
BASE_URL=https://SEU-STAGING pnpm test:load:smoke
```

## Referências

- [`docs/architecture.md`](../docs/architecture.md) — seção 12
- [`.cursor/rules/testing.mdc`](../.cursor/rules/testing.mdc)
