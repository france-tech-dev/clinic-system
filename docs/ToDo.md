# Roadmap — Clinic System

Só itens **abertos** ou parcialmente abertos.  
Arquitetura: [`architecture.md`](./architecture.md) · testes: [`tests/README.md`](../tests/README.md)

Legenda: `[x]` feito · `[ ]` pendente

---

## Ordem atual

```
P1–P4, P6 — concluídos (agenda, PDF, caixa, polish, multi-profissional)
RBAC dinâmico + writes compostos — concluídos
P5 — Relatórios clínicos (núcleo) — em grande parte feito
```

---

## RBAC — papéis por clínica

**Status:** concluído

- [x] `dynamicAccessControl` + tabela `organizationRole` + `Member.role` String
- [x] Recursos por módulo: patients, schedule, finance, team, clinical, settings, reports
- [x] Papéis: OWNER/CLIENT (sistema) + ADMIN/MANAGER/MEMBER (seed) + extras na UI
- [x] UI `/profissionais` — abas Equipe | Papéis (matriz CRUD)
- [x] Actions/proxy/sidebar por módulo; CLIENT sem grants de painel
- [x] Create paciente+responsável atómico (`createWithNewGuardian`); update sequencial
- [x] Padrão em `.cursor/rules/composite-writes.mdc`
- [x] Gate UI na aba Papéis (`team:create` / `update` / `delete`)

---

## P3+ — Caixa (melhorias futuras)

- [ ] Controle de sessões restantes em pacote
- [x] Export CSV do caixa

---

## P5 — Relatórios clínicos (expansão)

**Status:** núcleo clínico da fase 1 fechado (hub, GMFM PDF, ficha, paginação, termos)

### Feito

- [x] **Hub `/relatorio`** — prontuário, ficha e anamnese (`reports:read`)
- [x] **GMFM-88 PDF** — respostas, scores e comparativo
- [x] **Nova ficha TO** no paciente (separado de Instrumentos)
- [x] **Paginação + filtros** server-side em `/pacientes` (10/página)
- [x] **Termos e condições de uso** + **Política de privacidade** (footer + signup)

### Pendente (fora do “completo” fase 1)

- [ ] **Portal dos pais** — `/portal` ainda é stub
- [ ] **Exportação** — PDF/CSV das listagens (após regra clara vs página atual)
- [ ] **WhatsApp** — lembrete de consulta para o responsável (1.º job real candidato)
- [ ] **Estoque** — Nome, Quantidade, Preço, Validade, Fornecedor, …

### Observabilidade (futuro)

- [ ] Relatório de acessos / erros / performance

---

## Billing — mensalidade Stripe

**Status:** schema + trial + webhook + seats/extras + prices live + Customer Portal

Plano de produto: [`billing.md`](./billing.md). Nada pendente de código neste bloco — só ops Stripe em ambientes novos.

---

## Jobs / infra

- Redis + rate limit + stub consumer: ✅ — [`jobs-queues.md`](./jobs-queues.md)
- [ ] Primeiro job real com `produce()` (WhatsApp ou media)
- [ ] Redis + `pnpm consumer` no deploy de produção
- [ ] R2 em produção se ainda em disco local — [`media-storage.md`](./media-storage.md)

---

## Notas

- **IA:** [`ai.md`](./ai.md)
- **Scoring TO / normas:** [`avaliacao/scoring-oficial-to.md`](./avaliacao/scoring-oficial-to.md) (SPM Casa 5–12 com T/bandas no código; outros instrumentos aguardam tabelas/licença)
- **Nome da clínica:** sempre `Organization.name`
- **Conflito de horário na agenda:** fora de escopo (explícito)
- **Ops:** aplicar migration RBAC (`pnpm db:migrate`) em cada ambiente antes do smoke
