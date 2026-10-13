# Roadmap — Clinic System

Só itens **abertos** ou parcialmente abertos.  
Arquitetura: [`architecture.md`](./architecture.md) · testes: [`tests/README.md`](../tests/README.md)

Legenda: `[x]` feito · `[ ]` pendente

---

## Ordem atual

```
P1–P4, P6 — concluídos (agenda, PDF, caixa, polish, multi-profissional)
P5 — Relatórios clínicos (expansão) — em curso
```

---

## P3+ — Caixa (melhorias futuras)

- [ ] Controle de sessões restantes em pacote
- [ ] Export CSV do caixa

---

## P5 — Relatórios clínicos (expansão)

**Status:** PDF e protocolos no fluxo atual · hub `/relatorio` e export GMFM pendentes

### Pendente

- [ ] **Hub `/relatorio`** — gerar PDF (prontuário, anamnese, avaliação) num só sítio
- [ ] **GMFM-88 PDF** — exportar/visualizar o comparativo / ficha preenchida
- [ ] **Portal dos pais** — `/portal` ainda é stub
- [ ] **Ficha de avaliação** — domínios, itens, respostas e resultado final
- [ ] **Paginação** — listas com 10 itens por página
- [ ] **Filtros** — data, nome, idade, etc. nas listagens
- [ ] **Exportação** — PDF/CSV das listagens
- [ ] **Termos e condições de uso**
- [ ] **Política de privacidade**

### Futuro

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
