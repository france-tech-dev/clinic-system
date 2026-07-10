# Roadmap — Fichário TO

Checklist de melhorias, ordenado por prioridade.  
Legenda: `[x]` feito · `[~]` parcial · `[ ]` pendente

---

## P1 — Calendário visual com drag-and-drop

**Prioridade:** alta — impacto imediato no uso diário da clínica.

### Já temos (clinic-system)

- [x] Agenda em `/agenda` com CRUD completo (`features/schedule/`)
- [x] Status: agendado, realizado, faltou, cancelado
- [x] Repetição semanal (`repeatWeeks` 1–52)
- [x] Vista em **lista** por dia + navegação por data + “Próximos agendamentos”
- [~] Sem grade semanal/mensal, sem drag-and-drop, sem validação de conflitos de horário

### Referência (france-barbershop)

Repositório: [ArielVinis/france-barbershop](https://github.com/ArielVinis/france-barbershop.git)

| O que portar                      | Onde está na barbearia                              |
| --------------------------------- | --------------------------------------------------- |
| Calendário visual                 | `react-big-calendar` em `/panel/schedule`           |
| Duas vistas (tabela + calendário) | `panel/schedule` — owner vê ambas                   |
| Drag-and-drop / realocar          | `rescheduleBookingOwner` + calendário               |
| Intervalos unificados             | `features/schedule/_lib/schedule-bookings-range.ts` |
| Conflitos de horário              | `features/booking/_lib/booking-conflict.ts`         |

> Melhorias na barbearia podem ser feitas no próprio repo antes ou durante a portagem.

### Decisões

- [x] Manter **duas vistas**: lista (atual) + calendário (nova)
- [x] Drag-and-drop deve alterar **horário e dia** (mover entre dias)
- [ ] Adaptar domínio: `Booking` (barbearia) → `Appointment` (clínica, ligado a `Patient`)

### Subtarefas

- [ ] Instalar `react-big-calendar` (+ tipos, se necessário)
- [ ] Criar componente de calendário em `/agenda` (tab ou toggle Lista / Calendário)
- [ ] Action de reagendamento por drag (`updateAppointmentAction` ou action dedicada com `date` + `time`)
- [ ] Carregar intervalo de appointments por semana/mês (helper tipo `schedule-bookings-range`)
- [ ] (Opcional) Validação de conflitos de horário no mesmo slot
- [ ] Testar: arrastar dentro do dia, arrastar para outro dia, editar via dialog existente

---

## P2 — Cabeçalho nos relatórios impressos

**Prioridade:** média — quick win; assinatura já funciona.

### Já temos

- [x] Impressão via `window.print()` no prontuário (`paciente-detail-client.tsx`)
- [x] Tipos: prontuário completo, avaliação, anamnese, roteiro
- [x] **Assinatura do profissional** — `/configuracoes` + `formatProfessionalSignature`
- [x] **Nome da clínica** — `professional.clinica` no cabeçalho e rodapé
- [x] CSS de impressão — `globals.css` (`.print-report`, `.no-print`)
- [x] Campo `Organization.logo` no Prisma (ainda não usado na impressão)

### Falta

- [ ] **Logo** no cabeçalho (hoje só texto “Fichário TO”)
- [ ] Cabeçalho padronizado: logo + nome da organização + título do documento
- [ ] Usar `Organization.logo` + `Organization.name` (fallback: `professional.clinica`)
- [ ] UI para upload/gestão da logo da clínica (se ainda não existir)

### Pendente de definir

- [ ] Logo vem de `Organization.logo` (upload), se não tiver, usar logo fixa do systema.
- [ ] Basta melhorar a impressão atual ou gerar **PDF para download** (`@react-pdf/renderer` ou similar)? Ambos. Sobre a biblioteca, podemos verificar qual a mais indicada.

---

## P3 — Fluxo de caixa

**Prioridade:** baixa por agora — feature nova; depende de regras de negócio.

### Já temos

- [x] Agendamentos com status (base possível para receita por sessão)
- [ ] Nada no domínio financeiro: sem modelos Prisma, UI ou actions

### Referência útil (france-barbershop)

- Pagamentos ao finalizar atendimento (`PaymentMethod`, `PaymentStatus` no schema)
- Dashboard com faturamento

> Portar só o que fizer sentido para clínica TO (sem booking público / Stripe).

### Pendente de definir

- [ ] Escopo: só entradas (sessões pagas) ou entradas + saídas (despesas)?
- [ ] Vínculo com paciente/agendamento ou lançamentos avulsos?
- [ ] Relatórios (diário, mensal, por profissional)?
- [ ] Valor por sessão/paciente ou tabela de preços?
- [ ] Caixa por **organização** ou por **profissional**?

### Subtarefas (quando escopo definido)

- [ ] Modelos Prisma (`Transaction`, categorias, formas de pagamento)
- [ ] Feature `features/finance/` (repository, service, schema, actions)
- [ ] UI em nova rota ou secção do painel
- [ ] (Opcional) Integração: marcar sessão como “realizado” → sugerir lançamento

---

## Ordem de execução

```
1. P1 — Calendário (duas vistas + drag entre dias)
2. P2 — Cabeçalho de impressão (logo + empresa)
3. P3 — Fluxo de caixa (após definir escopo)
```

---

## Notas

- **Calendário:** reutilizar padrão da barbearia; melhorias no [france-barbershop](https://github.com/ArielVinis/france-barbershop.git) são bem-vindas antes da portagem.
- **Impressão:** não confundir com “gerar PDF” — hoje é print do browser; item do checklist cobre cabeçalho visual nos documentos impressos.
- **Fluxo de caixa:** maior esforço; adiar até P1 e P2 estáveis.
