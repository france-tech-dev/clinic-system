# Auditoria de arquitetura — Fichário TO

Checklist de refactors e movimentos de código, ordenado por prioridade.  
Baseado na estrutura actual (monólito modular por feature) e nas regras em [`architecture.md`](./architecture.md) e `.cursor/rules/`.

Legenda: `[ ]` pendente · `[~]` parcial · `[x]` feito

**Última revisão:** 2026-07-14 (auditoria de domínio multi-profissional — P6)

---

## Princípios (manter)

1. **Estrutura actual** — `app/` → `features/` → `shared/`; não migrar para DDD completo.
2. **Corrigir excepções** — services que acedem ao `db` directamente, imports entre features, imports cruzados entre rotas.
3. **Partir ficheiros grandes** — limiar ~300–400 linhas (excluir shadcn gerados e constantes estáticas).
4. **Testes nos services** — começar por funções puras e regras de negócio isoláveis.

### Fluxo de dependências (referência)

```
app/  →  features/  →  shared/
         ↓
    components/  (só shared/, nunca features/)
```

---

## P0 — Violações de regras (corrigir primeiro)

Impacto alto, diff pequeno. Fazer antes de features novas.

### P0.1 — Import cruzado entre rotas (agenda → caixa)

| Item                      | Detalhe                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Problema**              | `agenda-client.tsx` importa `CashTransactionFormDialog` de `caixa/_components/`               |
| **Ficheiro**              | `src/app/(authenticated)/agenda/agenda-client.tsx` (L24–27)                                   |
| **Regra violada**         | `.cursor/rules/route-shared-ui.mdc` — `_components` é local à rota                            |
| **Acção**                 | Mover para `src/features/finance/components/cash-transaction-form-dialog.tsx`                 |
| **Actualizar imports em** | `agenda/agenda-client.tsx`, `caixa/caixa-client.tsx`, `caixa/_components/` (remover original) |
| **Exportar também**       | `CashTransactionDraft` (tipo usado pela agenda ao sugerir lançamento)                         |

- [x] Mover dialog + tipo para `features/finance/components/`
- [x] Actualizar imports nas duas rotas
- [x] Remover ficheiro antigo em `caixa/_components/`

---

### P0.2 — `dashboard.service.ts`: `db` directo + import de `finance`

| Item              | Detalhe                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Problema 1**    | 10 queries Prisma inline; não existe `dashboard.repository.ts`                                                    |
| **Problema 2**    | `import { getCashflowPageData } from "@/features/finance/finance.service"` — features não devem importar entre si |
| **Ficheiro**      | `src/features/dashboard/dashboard.service.ts` (192 linhas)                                                        |
| **Regra violada** | `.cursor/rules/nextjs-server-actions.mdc` — DB só em repository; features isoladas                                |

**Acção recomendada (3 passos):**

1. Criar `dashboard.repository.ts` — mover todas as queries `db.*` para lá.
2. Extrair lógica pura de alertas para `dashboard/_lib/build-dashboard-alerts.ts`:
   - regra: paciente activo sem avaliação → alerta `sem_avaliacao`
   - regra: última avaliação ≥ 90 dias → alerta `reavaliacao`
3. Orquestração financeira no **page**, não no service:
   - `painel/page.tsx` chama `getDashboardData(orgId)` + `getCashflowPageData(orgId)` em `Promise.all`
   - passa `financeSummary` e `financeMonthLabel` como props ao client
   - remover import de `finance` de dentro de `dashboard.service.ts`

- [x] Criar `dashboard.repository.ts`
- [x] Extrair `buildDashboardAlerts` para `_lib/`
- [x] Mover composição financeira para `painel/page.tsx`
- [x] Remover `import` de `finance` em `dashboard.service.ts`

---

### P0.3 — `search.service.ts`: `db` directo (sem repository)

| Item         | Detalhe                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| **Problema** | `globalSearch` faz 5 queries Prisma inline                                         |
| **Ficheiro** | `src/features/dashboard/search.service.ts` (113 linhas)                            |
| **Acção**    | Criar `dashboard/search.repository.ts` (ou `search.repository.ts` no mesmo módulo) |

- [x] Criar repository com métodos `searchPatients`, `searchExercises`, etc.
- [x] `search.service.ts` fica só com mapeamento → `SearchHit[]`

---

### P0.4 — `finance.service.ts`: `db` directo em `assertPatientInOrg`

| Item         | Detalhe                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| **Problema** | Validação de paciente na org usa `db.patient.findFirst` no service          |
| **Ficheiro** | `src/features/finance/finance.service.ts` (L81–91)                          |
| **Acção**    | Mover para `finance.repository.ts` → `existsPatientInOrg(orgId, patientId)` |

- [x] Adicionar método no repository
- [x] Service chama repository em vez de `db`

---

## P1 — Ficheiros grandes (partir em ~300–400 linhas)

Excluídos da lista: `sidebar.tsx`, `chart.tsx`, `roteiros.ts`, `anamnese-schema.ts` (dados/config estáticos ou shadcn).

| Prioridade | Ficheiro                                              | Linhas | Acção sugerida                                                                                                   |
| ---------- | ----------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| **P1.1**   | `patient/patient.actions.ts`                          | 337    | Manter actions finas; se crescer, agrupar revalidações em `_lib/revalidate-patient-paths.ts`                     |
| **P1.2**   | `patient/patient.service.ts`                          | 311    | Extrair mappers (`toPatientDTO`, `toEvaluationDTO`, …) para `patient/_lib/mappers.ts`                            |
| **P1.3**   | `patient/patient.repository.ts`                       | 275    | Quando passar 300: separar sub-repos internos (`evaluations`, `sessions`) ou ficheiros `_lib/patient-queries.ts` |
| **P1.4**   | `agenda/agenda-client.tsx`                            | 379    | Extrair lógica de “marcar realizado → sugerir caixa” para hook `use-agenda-cashflow.ts`                          |
| **P1.5**   | `pacientes/.../evaluation-form-dialog.tsx`            | 320    | Extrair secções do formulário para sub-componentes em `_components/evaluation-form/`                             |
| **P1.6**   | `finance/components/cash-transaction-form-dialog.tsx` | 281    | Movido em P0.1 ✅; avaliar split campo a campo se crescer                                                        |

### Split sugerido — `patient.service.ts`

```
features/patient/
├── patient.service.ts          # facade — exporta funções públicas
├── _lib/
│   ├── mappers.ts              # toPatientDTO, toEvaluationDTO, …
│   ├── evaluation-service.ts   # (futuro) create/update/delete evaluation
│   └── session-service.ts      # (futuro) create/update/delete session
```

- [x] P1.2 — Extrair mappers para `_lib/mappers.ts`
- [x] P1.4 — Hook `use-agenda-cashflow.ts`
- [x] P1.5 — Sub-componentes do evaluation form

---

## P2 — Consistência de camadas

Itens que não quebram regras graves, mas afastam o padrão repository → service → actions.

| Item                                   | Situação actual                                            | Acção                                                                     |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| `server/organizations/` vs `features/` | Auth/org em `server/`, domínio em `features/`              | Manter; documentar que `server/` = infra Better Auth, não negócio         |
| `dashboard.service.ts` types inline    | Types no mesmo ficheiro do service                         | Mover para `dashboard.types.ts` quando fizer P0.2                         |
| Duplicação `toDTO`                     | Cada service tem mapper local                              | Aceitável por isolamento; unificar só se incomodar                        |
| `patient.service.ts` monolítico        | CRUD de paciente + avaliação + sessão + anamnese + roteiro | Split em `_lib/` quando passar 400 linhas ou ao adicionar P5 (protocolos) |

- [ ] Criar `dashboard.types.ts` (junto com P0.2) — ✅ feito em P0.2
- [ ] Documentar fronteira `server/` vs `features/` (nota abaixo)

**Nota `server/` vs `features/`:**  
`src/server/auth/` e `src/server/organizations/` tratam sessão, convites e permissões Better Auth. Lógica clínica (pacientes, agenda, caixa) fica sempre em `features/`. Não mover auth para features.

---

## P3 — Movimentos de código (UI partilhada)

Verificar antes de criar componente em `app/.../_components/`.

| Componente / hook              | Usado em                   | Destino correcto               | Estado         |
| ------------------------------ | -------------------------- | ------------------------------ | -------------- |
| `CashTransactionFormDialog`    | `/agenda`, `/caixa`        | `features/finance/components/` | ✅ P0.1        |
| `PatientPdfPreviewDialog`      | `/pacientes`, `/relatorio` | `features/patient/components/` | ✅ já correcto |
| `use-patient-pdf-report`       | `/pacientes`, `/relatorio` | `features/patient/hooks/`      | ✅ já correcto |
| `EvaluationReportContentField` | `/relatorio`               | `features/patient/components/` | ✅ já correcto |

### Checklist antes de novo `_components`

1. Será usado só nesta rota? → `_components/` local
2. Outra rota do mesmo domínio precisa? → `features/[dominio]/components/`
3. Várias features precisam? → `shared/` ou `components/`

---

## P4 — Testes (prioridade por ROI)

**Estado actual:** Vitest configurado — **28 testes** em funções puras e services (`pnpm test`).

### Setup

```bash
pnpm add -D vitest   # ✅ instalado
pnpm test            # vitest run
pnpm test:watch      # modo watch
```

Config: `vitest.config.ts` — testes em **`tests/unit/`** (não em `src/`). Ver [`tests/README.md`](../tests/README.md).

```bash
pnpm test            # unitários (Vitest)
pnpm test:unit       # idem
pnpm test:watch      # modo watch
pnpm test:e2e        # Playwright — pendente (tests/e2e/)
```

### Onde testar primeiro (funções puras → regras → integração)

| Prioridade | Alvo              | Ficheiro de teste                                                 | O que testar                     |
| ---------- | ----------------- | ----------------------------------------------------------------- | -------------------------------- |
| **T1**     | Resumo financeiro | `tests/unit/features/finance/build-summary.test.ts`               | Soma entradas/saídas/saldo       |
| **T2**     | Mês caixa         | `tests/unit/features/finance/month-utils.test.ts`                 | `parseMonthParam`, bounds, shift |
| **T3**     | Calendário        | `tests/unit/features/schedule/appointment-calendar-utils.test.ts` | data/hora, cores                 |
| **T4**     | Alertas painel    | `tests/unit/features/dashboard/build-dashboard-alerts.test.ts`    | 90 dias, sem avaliação           |
| **T5**     | Reagendamento     | `tests/unit/features/schedule/schedule.service.test.ts`           | `invalid_status`, sucesso        |
| **T6**     | Paciente na org   | `tests/unit/features/finance/...` (pendente)                      | `existsPatientInOrg`             |
| **T7**     | Money utils       | `tests/unit/shared/money-utils.test.ts`                           | parse/format BRL                 |

### O que **não** testar primeiro

- Actions com `revalidatePath` (mock pesado)
- Componentes shadcn
- PDF / `@react-pdf/renderer` (snapshot frágil)
- Seeds e scripts Prisma

- [x] Adicionar Vitest ao projecto
- [x] T1 — `build-summary.test.ts`
- [x] T2 — `month-utils.test.ts`
- [x] T3 — `appointment-calendar-utils.test.ts`
- [x] T4 — `build-dashboard-alerts.test.ts`
- [x] T5 — `schedule.service.test.ts` (mock repository)
- [x] T7 — `money-utils.test.ts`

---

## P5 — Polish / backlog

| Item                              | Notas                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| Migration Prisma versionada       | Já em `docs/ToDo.md` P4 — necessário antes de deploy; pré-requisito saudável para P6.1        |
| Logo em produção (S3/R2)          | Já em `docs/ToDo.md` P2                                                                       |
| `anamnese-schema.ts` (643 linhas) | Dados estáticos — OK; se crescer P5 (formulários por especialidade), partir por especialidade |
| `evaluation-form-dialog.tsx`      | Crescerá com P5 — planear sub-formulários cedo                                                |
| T6 — teste `existsPatientInOrg`   | Pendente (ver P4 testes)                                                                      |
| E2E Playwright                    | Pasta `tests/e2e/` — setup pendente                                                           |

---

## P6 — Domínio multi-profissional (auditoria 2026-07-14)

Auditoria de **dados e ownership clínico**: quem atende, de onde vem o nome no calendário, e o que falta no Prisma.  
Não reabre P0–P1 de camadas (já concluídos). Entregar **por fases** — uma fatia por sessão/PR.

### Achados (estado na auditoria; P6.1 já corrige Appointment)

| Área                                             | Situação na auditoria | Depois de P6.1                                            |
| ------------------------------------------------ | --------------------- | --------------------------------------------------------- |
| `Appointment`                                    | Sem `memberId`        | ✅ `memberId` → `Member`                                  |
| Calendário WIP settings                          | Nome global da org    | ✅ `professionalName` por evento                          |
| Settings `professional.*`                        | Perfil org            | Mantém-se (PDF/assinatura)                                |
| `Evaluation` / `SessionNote` / `CashTransaction` | Sem autor             | Cash ✅; Evaluation/SessionNote ✅; ProtocolAssessment ✅ |
| Route UI `parsePatientPriceInput`                | Import cruzado        | ✅ `features/patient/_lib/patient-price-input.ts`         |

### Decisões de desenho (acordadas)

1. Profissional do agendamento = **`Member` da organização** (`Appointment.memberId` → `Member`).
2. Nome no calendário = `member.user.name` (por evento), **não** perfil de Configurações.
3. Configurações: **Meu CREFITO** em `Member.metadata`; perfil org = fallback PDF.
4. UX create: pré-selecionar membro da sessão; permitir trocar na lista.
5. `onDelete: Restrict` no membro com agendamentos (preservar histórico).
6. Autoria em Evaluation/SessionNote/Cash = **fases posteriores** (não bloquear P6.1).

### Passos a realizar (checklist)

Legenda: `[ ]` pendente · `[~]` em curso · `[x]` feito

#### P6.0 — Documentação desta auditoria

- [x] Inventariar schema (Appointment vs Member, gaps de autoria)
- [x] Inventariar schedule DTO/actions (sem profissional)
- [x] Inventariar uso Member vs settings vs WIP agenda
- [x] Actualizar este documento (secção P6) + mapa de features (`protocol`)
- [x] Ligar passos ao [`ToDo.md`](./ToDo.md)

#### P6.1 — Fase 1: `Appointment.memberId`

- [x] Schema Prisma: `Appointment.memberId` → `Member` + relação inversa; índice
- [x] Migração + backfill (membro owner/admin da org, senão o primeiro da org) — `prisma db push` + `prisma/backfill-appointment-member.ts`
- [x] `memberId` obrigatório após backfill
- [x] `schedule.types`: `memberId`, `professionalName`
- [x] `schedule.schema`: `memberId` em create/update
- [x] `schedule.repository`: include `member.user.name`; `findOrgMembers`; validar member na org
- [x] `schedule.service` + actions: gravar/mapear; default = membro da sessão
- [x] `appointment-calendar-utils`: `professionalName` **por evento**
- [x] UI: select “Profissional” no form; reverter prop global / `getProfessionalProfile` na agenda
- [x] Card calendário: nome do member à esquerda + ícone drag
- [x] Testes unitários schedule (DTO / reschedule com member)

#### P6.2 — Fase 2: filtro na agenda

- [x] Helper puro `filterAppointmentsByMemberId` + testes
- [x] UI lista + calendário: select “Profissional” (Todos / membros)
- [x] Persistência via query `?member=` (validado no page)

#### P6.3 — Fase 3: caixa / relatório por profissional

**Decisão:** `CashTransaction.memberId` opcional → `Member` (`onDelete: SetNull`).  
Não derivar só do appointment — permite filtro/histórico e lançamentos manuais com profissional.

- [x] Documentar decisão (membro no lançamento, não só no draft)
- [x] Schema + `db push` (`memberId` nullable; sem backfill obrigatório)
- [x] DTO/schema/repo/service: gravar/validar member; `getCashflowPageData(..., memberId?)`
- [x] Form caixa + draft agenda (`memberId` do appointment)
- [x] UI `/caixa`: filtro `?member=` + nome na linha; resumo no subset filtrado
- [x] Teste draft agenda com `memberId`

#### P6.4 — Fase 4: autoria clínica

- [x] `Evaluation.memberId` e `SessionNote.memberId` (opcional, `SetNull`)
- [x] Preencher autor na **criação** com o membro da sessão
- [x] DTO: `memberId` + `professionalName`; listas avaliação/evolução mostram o nome
- [x] `ProtocolAssessment.memberId` + nome no histórico GMFM; autor = membro da sessão na criação
- [x] PDF multi-CREFITO: `Member.metadata.professional` (Meu CREFITO) → assinatura da avaliação;
      fallback = perfil org (Configurações)
- [x] Migration `20260714153000_member_protocol_author` (`member.metadata` + `protocol_assessments.memberId`)

#### P6.5 — Limpezas paralelas

- [x] Mover `parsePatientPriceInput` / `formatPatientPriceInput` → `features/patient/_lib/patient-price-input.ts`
- [x] `CashflowSummary` → `shared/types/cashflow.ts` (dashboard deixa de importar `finance`)
- [x] `ProfessionalProfile` / PDF branding helpers → `shared/types/professional.ts` (patient PDF deixa de importar `settings`)
- [x] Migration Prisma baseline versionada (`prisma/migrations/20260714180000_init`) + `migrate resolve --applied` no DB local
- [ ] (Menor) `finance/components` ainda tipa `PatientDTO` de `patient` — aceitável como prop de UI; extrair `{ id; name }` só se incomodar

### Ordem de execução P6

```
P6.0  Auditoria documentada                                              ✅
P6.1  Appointment.memberId + schedule + UI agenda                        ✅
P6.2  Filtro por profissional na agenda                                  ✅
P6.3  Relatório / caixa por profissional                                  ✅
P6.4  Autoria Evaluation/SessionNote + ProtocolAssessment/PDF            ✅
P6.5  Limpezas (route-shared-ui, shared types, migrate)                   ✅
```

Cada item de P6.1–P6.3 = validar no browser + `pnpm test` no domínio tocado. **Não** misturar filtro ou finance na mesma PR da P6.1.

---

## Ordem de execução recomendada

```
1. P0.1 — Mover CashTransactionFormDialog para features/finance/     ✅
2. P0.2 — Refactor dashboard (repository + orquestração no page)     ✅
3. P0.3 — search.repository.ts                                       ✅
4. P0.4 — assertPatientInOrg → finance.repository                    ✅
5. P4   — Setup Vitest + T1–T4                                       ✅
6. P1.2 — Mappers patient → _lib/mappers.ts                          ✅
7. P1.4 — Hook use-agenda-cashflow                                    ✅
8. P1.5 — Split evaluation-form-dialog                                ✅
9. P6.0 — Auditoria domínio multi-profissional                       ✅ (2026-07-14)
10. P6.1 — Appointment.memberId + agenda UI                          ✅
11. P6.2 — Filtro profissional                                       ✅
12. P6.3 — Relatório caixa por profissional                          ✅
13. P6.4 — Autoria Evaluation/SessionNote + ProtocolAssessment/PDF   ✅
14. P6.5 — Limpezas (route-shared-ui, migrate, types)                ✅
```

**P6 multi-profissional:** concluído (member em agenda/caixa/autoria clínica, ProtocolAssessment, PDF multi-CREFITO por Member + fallback org, limpezas).

---

## Mapa de features (estado actual)

| Feature     | repository | service | actions | schema | types |     _lib      | components/hooks |
| ----------- | :--------: | :-----: | :-----: | :----: | :---: | :-----------: | :--------------: |
| `patient`   |     ✅     |   ✅    |   ✅    |   ✅   |  ✅   | ✅ PDF, meta  |        ✅        |
| `schedule`  |     ✅     |   ✅    |   ✅    |   ✅   |  ✅   | ✅ calendário |        —         |
| `finance`   |     ✅     |   ✅    |   ✅    |   ✅   |  ✅   |   ✅ month    |    ✅ dialog     |
| `settings`  |     ✅     |   ✅    |   ✅    |   ✅   |  ✅   |       —       |        —         |
| `dashboard` |     ✅     |   ✅    |   ✅    |   —    |  ✅   |  ✅ alertas   |        —         |
| `protocol`  |     ✅     |   ✅    |   ✅    |   ✅   |  ✅   |    ✅ GMFM    |        ✅        |

**Nota P6.1:** ✅ concluída — calendário usa `member.user.name` por evento; settings só PDF.

---

## Referências internas

- Estrutura e camadas: `.cursor/rules/project-core.mdc`
- Server Actions: `.cursor/rules/nextjs-server-actions.mdc`
- UI partilhada: `.cursor/rules/route-shared-ui.mdc`
- React / dados: `.cursor/rules/react-effects-and-data.mdc`
- Roadmap funcional: `docs/ToDo.md`
