# Roadmap — Clinic System

Checklist de melhorias, ordenado por prioridade.  
Legenda: `[x]` feito · `[~]` parcial · `[ ]` pendente

**Arquitetura e regras do projeto:** [`docs/architecture.md`](./architecture.md)  
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
- [x] ProtocolEvaluation autor + PDF com registro profissional (Member.metadata + fallback org)

---

## P2 — Relatórios PDF

**Status:** concluído

- [x] `@react-pdf/renderer` — templates refatorados (`shared/lib/pdf/` + `features/patient/_lib/pdf/`)
- [x] Preview (`PDFViewer`) + download
- [x] Cabeçalho: logo + nome da organização + título
- [x] Rodapé: assinatura e registro profissional + data de emissão + numeração
- [x] Upload de logo em `/configuracoes`
- [x] Nome da clínica unificado em **`Organization.name`** (PDF e configurações)

### Futuro

- [x] **Logo / media em produção:** driver R2 pronto em código. Configurar Custom Domain no bucket + env `OBJECT_STORAGE_DRIVER=r2` — ver [`docs/media-storage.md`](media-storage.md)

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
- [x] **Rate limit IP no proxy** — `advanced.ipAddress.ipAddressHeaders: ["x-real-ip"]` (Dokploy/Traefik)

---

## Ordem de execução (atualizada)

```
1. P1 — Calendário ✅
2. P2 — PDF + branding ✅
3. P3 — Caixa MVP ✅ → extensões ✅
4. P4 — Polish + rate limit (DB + ipAddress Traefik) ✅
5. P6 — Multi-profissional (P6.0–P6.5 ✅)
6. P5 — Relatórios clínicos (expansão) — em curso
```

---

## P5 — Relatórios clínicos (expansão)

**Status:** PDF e protocolos no fluxo atual · hub `/relatorio` e export GMFM pendentes

### Concluído

- [x] PDF de prontuário / anamnese a partir do detalhe do paciente e dos formulários (preview + download) — ver P2
- [x] **Avaliação dos pacientes** — campo selecionável para escolher o que irá para o relatório (domínios/seções)
- [x] **Protocolos estruturados** — GMFM-88 em `/avaliacoes/gmfm-88` (formulário 88 itens, percentuais, gráfico comparativo avaliação vs. reavaliação)
- [x] **Evolução na agenda** — criar evolução diretamente a partir do agendamento
- [x] **Anamnese por especialidade** — hub `/anamnese` filtrado pelas profissões ativas (1ª entrega: T.O.)

### Pendente

- [ ] **Score + gráfico TO** — raw + comparativo ✅ (sem normas) · ver [`avaliacao/scoring-oficial-to.md`](./avaliacao/scoring-oficial-to.md) · auditoria templates / normas pendente
- [ ] **Hub `/relatorio`** — página dedicada para gerar PDF (prontuário, anamnese, avaliação) num só sítio
- [ ] **GMFM-88 PDF** — exportar/visualizar o comparativo / ficha preenchida em PDF
- [ ] **Portal dos pais** — página para acompanharem as atividades realizadas com seus filhos (`/portal` ainda é stub)
- [ ] **Ficha de avaliação** — ficha com todos os domínios e subdomínios, itens, respostas e resultado final
- [ ] **Paginação** — listas com 10 itens por página
- [ ] **Filtros** — por data, nome, idade, etc. nas listagens
- [ ] **Exportação** — PDF/CSV das listagens

- [ ] **Termos e condições de uso** — página para os termos e condições de uso do sistema
- [ ] **Política de privacidade** — página para a política de privacidade do sistema

### Futuro

[ ] **Envio de WhatsApp pelo sistema** — lembrete de consulta para o responsável
[ ] **Estoque** — Nome, Quantidade, Preço, Preço de venda, Total, Validade, Compra, Fornecedor, Observações

### Observabilidade (futuro)

- [ ] Relatório de acessos (dispositivo: computador, celular, tablet, …)
- [ ] Relatório de erros (sistema, usuário, rede, …)
- [ ] Relatório de performance (tempo de resposta / processamento)

### Testes de performance e carga

- [ ] Teste com k6 (stress, performance, carga)

---

## Billing — mensalidade Stripe

**Status:** schema + trial + webhook + seats/extras · prices live Stripe pendentes

- [x] Plano em [`billing.md`](./billing.md) — Solo / Professional / Enterprise, tudo incluído
- [x] `OrganizationBilling` + trial 7 dias na criação da org (+ `extraSeats`)
- [x] Checkout (setup no trial / subscription após cancel) + webhook
- [x] `/plataforma` — isentar clínicas (`billingExempt` + `PLATFORM_ADMIN_USER_IDS`)
- [x] `/planos` — plano atual + Customer Portal + extras (só Enterprise)
- [ ] Preços e `STRIPE_PRICE_SOLO|PRO|ENTERPRISE|EXTRA_SEAT` / `STRIPE_SECRET_KEY` em produção (live)
- [ ] Ativar Customer Portal no Dashboard Stripe (Settings → Billing → Customer portal)

---

## Notas

- **IA:** fundação + interpretação de protocolos — [`docs/ai.md`](ai.md).
- **Nome da clínica:** usar sempre `Organization.name` (campo em `/configuracoes` → Identidade da clínica). O campo `professional.clinica` foi descontinuado.
- **Logo / media em produção:** pipeline em `shared/lib/media`; R2 — [`docs/media-storage.md`](media-storage.md). Dokploy com volume local pode adiar.
- **Jobs / filas (futuro):** Redis + BullMQ; worker Node no Dokploy; R2 para arquivos — [`docs/jobs-queues.md`](jobs-queues.md). Cloudflare Queues só como orquestração leve opcional.
- **Conflito de horário:** explicitamente fora de escopo.
- **Rate limit:** contadores na BD para réplicas Docker; ver README · seção Segurança.
