# Roadmap — Clinic System

Checklist de melhorias, ordenado por prioridade.  
Legenda: `[x]` feito · `[~]` parcial · `[ ]` pendente

**Arquitectura e regras do projecto:** [`docs/architecture.md`](./architecture.md)  
**Auditoria de refactors:** [`docs/architecture-audit.md`](./architecture-audit.md)  
**Testes (unit + E2E):** [`tests/README.md`](../tests/README.md)

---

## P1 — Calendário visual com drag-and-drop

**Status:** concluído

### Concluído

- [x] Agenda em `/agenda` com CRUD completo (`features/schedule/`)
- [x] Status: agendado, realizado, faltou, cancelado
- [x] Repetição semanal (`repeatWeeks` 1–52)
- [x] Vista **lista** + vista **calendário** (`react-big-calendar`)
- [x] Drag-and-drop altera horário e dia (`rescheduleAppointmentAction`)
- [x] Testes manuais: drag, edição via dialog

### Decisões

- [x] Duas vistas: lista + calendário
- [x] Drag-and-drop altera horário e dia
- [x] **Sem** validação de conflito de horário — profissionais podem atender mais de uma criança no mesmo slot

### Melhorias (P1+)

- [x] Link para cadastro do paciente a partir da agenda (lista + calendário)
- [x] Cor distinta no agendamento quando há evolução registrada (`SessionNote` compareceu na data)
- [x] Auditoria domínio multi-profissional — ver [`architecture-audit.md`](./architecture-audit.md) **P6**
- [x] **P6.1** — `Appointment.memberId` (Member) + nome por evento no calendário + select no form
- [x] **P6.2** — Filtro por profissional na agenda (`?member=`)
- [x] **P6.3** — Caixa por profissional (`CashTransaction.memberId` + filtro `/caixa`)
- [x] **P6.4** — Autoria em Evaluation/SessionNote (autor = membro da sessão)
- [x] **P6.5** — Limpezas (`patient-price-input`, shared types, migration baseline)
- [x] ProtocolEvaluation autor + PDF multi-CREFITO (Member.metadata + fallback org)

---

## P2 — Relatórios PDF

**Status:** concluído

- [x] `@react-pdf/renderer` — templates refatorados (`shared/lib/pdf/` + `features/patient/_lib/pdf/`)
- [x] Preview (`PDFViewer`) + download
- [x] Cabeçalho: logo + nome da organização + título
- [x] Rodapé: assinatura CREFITO + data de emissão + numeração
- [x] Upload de logo em `/configuracoes`
- [x] Nome da clínica unificado em **`Organization.name`** (PDF e configurações)

### Futuro

- [ ] **Logo em produção:** migrar de `public/uploads` local para storage externo (S3/R2) — necessário em deploy serverless

---

## P3 — Fluxo de caixa

**Status:** MVP + extensões concluídos · melhorias futuras pendentes

### Concluído (MVP)

- [x] Modelo `CashTransaction` + feature `features/finance/`
- [x] UI `/caixa` — entradas, saídas, resumo mensal
- [x] Confirmação antes de excluir lançamentos (`DeleteConfirmDialog`)

### Concluído (extensões)

- [x] **Preço por paciente** — sessão ou pacote no cadastro (`pricingType` + `priceCents`)
- [x] **Agenda → caixa** — ao marcar agendamento como **realizado**, sugerir lançamento de entrada
- [x] **Painel** — cards de faturamento do mês (entradas, saídas, saldo)

### Futuro

- [x] Relatório por profissional — audit **P6.3** ✅ (filtro `/caixa` + `memberId` no lançamento)
- [ ] Controle de sessões restantes em pacote
- [ ] Export CSV do caixa

---

## P4 — Polish transversal

**Status:** concluído · segurança auth incluída

- [x] Padrão `key` + montagem condicional em dialogs (evitar `useEffect` para sync de props)
- [x] `DeleteConfirmDialog` em deletes destrutivos (caixa, agenda, avaliação, evolução)
- [x] Migration Prisma versionada (além de `db push` em dev) — baseline `20260731063400_init`
- [x] Refactors de arquitetura — ver checklist consolidado em [`docs/architecture-audit.md`](./architecture-audit.md) (P0 + P1 + P4 + P6 concluídos)
- [x] **Rate limit** — Better Auth com `storage: "database"` (modelo `RateLimit`) + `/get-session` sem throttle; `assertRateLimit` em `/api/accept-invitation/[invitationId]`; UI trata 429; script `pnpm validate:rate-limit`
- [ ] **Rate limit IP no proxy** — configurar `ipAddress` no Better Auth quando o proxy de produção (Dokploy) expuser o header correcto

---

## Ordem de execução (atualizada)

```
1. P1 — Calendário ✅
2. P2 — PDF + branding ✅
3. P3 — Caixa MVP ✅ → extensões ✅
4. P4 — Polish + rate limit (DB) ✅ · ipAddress no proxy pendente
5. P6 — Multi-profissional (P6.0–P6.5 ✅)
6. P5 — Relatórios clínicos (expansão) — em curso
```

---

## P5 — Relatórios clínicos (expansão)

**Status:** PDF e protocolos no fluxo actual · hub `/relatorio` e export GMFM pendentes

### Concluído

- [x] PDF de prontuário / anamnese a partir do detalhe do paciente e dos formulários (preview + download) — ver P2
- [x] **Avaliação dos pacientes** — campo selecionável para escolher o que irá para o relatório (domínios/seções)
- [x] **Protocolos estruturados** — GMFM-88 em `/avaliacoes/gmfm-88` (formulário 88 itens, percentuais, gráfico comparativo avaliação vs. reavaliação)
- [x] **Evolução na agenda** — criar evolução directamente a partir do agendamento
- [x] **Anamnese por especialidade** — hub `/anamnese` filtrado pelas profissões activas (1ª entrega: T.O.)

### Pendente

- [ ] **Hub `/relatorio`** — página dedicada para gerar PDF (prontuário, anamnese, avaliação, roteiro) num só sítio
- [ ] **GMFM-88 PDF** — exportar/visualizar o comparativo / ficha preenchida em PDF
- [ ] **Portal dos pais** — página para acompanharem as atividades realizadas com seus filhos (`/portal` ainda é stub)
- [ ] **Ficha de avaliação** — ficha com todos os domínios e subdomínios, itens, respostas e resultado final
- [ ] **Paginação** — listas com 10 itens por página
- [ ] **Filtros** — por data, nome, idade, etc. nas listagens
- [ ] **Exportação** — PDF/CSV das listagens

### Observabilidade (futuro)

- [ ] Relatório de acessos (dispositivo: computador, celular, tablet, …)
- [ ] Relatório de erros (sistema, utilizador, rede, …)
- [ ] Relatório de performance (tempo de resposta / processamento)

---

## Billing — mensalidade Stripe

**Status:** schema + trial + webhook + gates no código · preços e keys Stripe pendentes

- [x] Plano em [`billing.md`](./billing.md)
- [x] `OrganizationBilling` + trial 7 dias na criação da org
- [x] Checkout (setup no trial / subscription após cancel) + webhook
- [x] `/plataforma` — isentar clínicas (`billingExempt` + `PLATFORM_ADMIN_USER_IDS`)
- [x] `/planos` — plano actual + Customer Portal (cartão / cancelar)
- [ ] Preços e `STRIPE_PRICE_*` / `STRIPE_SECRET_KEY` em produção (live)
- [ ] Activar Customer Portal no Dashboard Stripe (Settings → Billing → Customer portal)

---

## Notas

- **Nome da clínica:** usar sempre `Organization.name` (campo em `/configuracoes` → Identidade da clínica). O campo `professional.clinica` foi descontinuado.
- **Logo em produção:** anotado em P2 — implementar antes de deploy em Vercel/similar (Dokploy com volume local pode adiar).
- **Conflito de horário:** explicitamente fora de escopo.
- **Rate limit:** contadores na BD para réplicas Docker; ver README · secção Segurança.
