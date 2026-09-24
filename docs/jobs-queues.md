# Jobs e filas

Documento de decisão para **não esquecer** quando a Movi escalar (profissionais autónomos + clínicas, WhatsApp, PDFs, media).

**Estado atual:** processamento síncrono (ex. logo via media). Stub BullMQ em `shared/lib/jobs` (`produce`) + processo `consumer/` (requer `REDIS_URL`). Rate limit da app também no Redis. Alvo de pastas: [`target-structure.md`](./target-structure.md) (fase 1 em `src/` + `consumer/`; monorepo só com Fastify).

**Relacionados:** [`media-storage.md`](./media-storage.md) · [`architecture.md`](./architecture.md) · [`ToDo.md`](./ToDo.md)

---

## 1. Contexto

Com muitas organizações, os picos vêm de:

- Lembretes WhatsApp / e-mail por consulta
- PDFs e exports
- Processamento de imagens (avatar/logo) — leve hoje; fila só se deixar de ser síncrono
- Jobs por clínica (billing, limpezas, sync)

Padrão: **muitos jobs pequenos**, não event streaming de alto volume.

---

## 2. Decisão

| Camada                            | Escolha                     | Notas                                                                |
| --------------------------------- | --------------------------- | -------------------------------------------------------------------- |
| Filas                             | **Redis + BullMQ**          | Encaixa Next/Node; retries, delay, jobs agendados                    |
| Nomenclatura                      | **producer** / **consumer** | `produce()` na app; processo `consumer/` (BullMQ `Worker` por baixo) |
| Ficheiros                         | **R2** (URL na BD)          | Ver `media-storage.md`; local até ligar R2                           |
| Onde corre Sharp / PDF / WhatsApp | **Consumer Node** (Dokploy) | Não no CPU curto do Workers Free da Cloudflare                       |
| Cloudflare Queues / Workers       | Opcional depois             | Só orquestração leve; não motor principal de jobs pesados            |
| Kafka                             | **Não**                     | Overkill para este produto                                           |
| RabbitMQ                          | Só se já existir na stack   | Redis é mais simples para TypeScript puro                            |

### Porquê Redis + BullMQ

- Stack atual: Next.js no Dokploy + Neon
- Um contentor Redis (ou Redis gerido) basta no início
- API nossa: `produce('whatsapp.reminder', { organizationId, ... }, { delayMs })`
- Escala para milhares de clínicas com jobs pequenos sem Kafka
- O mesmo Redis serve **rate limit** (não sessões — essas ficam em Postgres + `cookieCache`)

### Cloudflare Queues — quando considerar

- Queres fila managed sem operar Redis
- O Worker Cloudflare **só dispara HTTP** para a API Movi; o trabalho pesado fica no consumer
- Free: ~10 000 operações/dia; paid barato em volume clínico moderado
- **Não** processar Sharp/PDF pesado dentro do Worker Free

---

## 3. Forma de implementar (quando for a hora)

1. Extrair trabalho para funções de job, ex. `processManagedImageJob`, `sendAppointmentReminderJob`.
2. Manter API da app estável: actions chamam `produce(...)` ou, no início, a função direta.
3. BullMQ:
   - `REDIS_URL` (obrigatória)
   - `consumer/` na raiz (Dokploy) + `src/shared/lib/jobs`
   - ver [`target-structure.md`](./target-structure.md)
4. Filas por domínio (nomes estáveis), não uma fila genérica “tudo”:
   - `media.process`
   - `whatsapp.reminder`
   - `billing.*` (se necessário)
5. Sempre incluir `organizationId` no payload (isolamento multi-tenant).
6. Retries com backoff; dead-letter / log para falhas repetidas.
7. Media: upload pode continuar síncrono até doer; só então `media.process` + UI “a processar”.

Contrato mental:

```ts
// Hoje
await saveUserAvatarImage(userId, file);

// Amanhã (mesmo resultado de negócio)
await produce("media.process", {
  kind: "avatar",
  userId /* ref ao upload temporário */,
});
```

---

## 4. Redis hoje (filas + rate limit)

- Filas BullMQ: `produce` / `consumer`
- Rate limit: `consumeRateLimit` + Better Auth `customStorage` (prefixo `rl:`)
- **Não** sessões Better Auth no Redis (evita `secondaryStorage` global)

---

## 5. Checklist de ativação

Alinhado a [`target-structure.md`](./target-structure.md):

- [x] Layout fase 1: `src/shared/lib/jobs` + `consumer/` na raiz
- [x] Stub `produce` / consumer + `REDIS_URL` obrigatória
- [x] `bullmq` + `ioredis` nas deps
- [x] Rate limit no Redis (tabela `rate_limit` removida)
- [ ] Redis no Dokploy (ou managed) + `REDIS_URL` em prod
- [ ] `pnpm consumer` / processo consumer no deploy
- [ ] Primeiro job real (provável: lembrete WhatsApp ou media)
- [ ] Ligar R2 se ainda estiver em disco local (`media-storage.md`)
- [ ] Monitorização básica (falhas, fila atrasada)
- [ ] (Fase 2) Com Fastify: mover jobs/shared/domains para `packages/` + `apps/api` / `apps/consumer`
