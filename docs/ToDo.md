# Roadmap — Fichário TO

Checklist de melhorias, ordenado por prioridade.  
Legenda: `[x]` feito · `[~]` parcial · `[ ]` pendente

---

## P1 — Calendário visual com drag-and-drop

**Status:** concluído (com melhorias em andamento)

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
- [ ] (Futuro) Filtro por profissional, se houver multi-profissional

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

**Status:** MVP + extensões em andamento

### Concluído (MVP)

- [x] Modelo `CashTransaction` + feature `features/finance/`
- [x] UI `/caixa` — entradas, saídas, resumo mensal
- [x] Confirmação antes de excluir lançamentos (`DeleteConfirmDialog`)

### Concluído (extensões)

- [x] **Preço por paciente** — sessão ou pacote no cadastro (`pricingType` + `priceCents`)
- [x] **Agenda → caixa** — ao marcar agendamento como **realizado**, sugerir lançamento de entrada
- [x] **Painel** — cards de faturamento do mês (entradas, saídas, saldo)

### Futuro

- [ ] Relatório por profissional
- [ ] Controle de sessões restantes em pacote
- [ ] Export CSV do caixa

---

## P4 — Polish transversal

- [x] Padrão `key` + montagem condicional em dialogs (evitar `useEffect` para sync de props)
- [x] `DeleteConfirmDialog` em deletes destrutivos (caixa, agenda, avaliação, evolução, biblioteca, estudo)
- [ ] Migration Prisma versionada (além de `db push` em dev)

---

## Ordem de execução (atualizada)

```
1. P1 — Calendário ✅
2. P2 — PDF + branding ✅
3. P3 — Caixa MVP ✅ → extensões ✅
4. P4 — Polish + deploy prep
```

---

## Notas

- **Nome da clínica:** usar sempre `Organization.name` (campo em `/configuracoes` → Identidade da clínica). O campo `professional.clinica` foi descontinuado.
- **Logo em produção:** anotado em P2 — implementar antes de deploy em Vercel/similar.
- **Conflito de horário:** explicitamente fora de escopo.
