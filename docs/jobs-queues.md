# Jobs e filas

Documento de decisão para **não esquecer** quando a Movi escalar (profissionais autónomos + clínicas, WhatsApp, PDFs, media).

**Estado actual:** processamento síncrono (ex. logo via media). Stub BullMQ em `shared/lib/jobs` + processo `worker` (no-op sem `REDIS_URL`). Alvo de pastas: [`target-structure.md`](./target-structure.md) (fase 1 em `src/` + `worker/`; monorepo só com Fastify).

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

| Camada                            | Escolha                   | Notas                                                     |
| --------------------------------- | ------------------------- | --------------------------------------------------------- |
| Filas / workers                   | **Redis + BullMQ**        | Encaixa Next/Node; retries, delay, jobs agendados         |
| Ficheiros                         | **R2** (URL na BD)        | Ver `media-storage.md`; local até ligar R2                |
| Onde corre Sharp / PDF / WhatsApp | **Worker Node** (Dokploy) | Não no CPU curto do Workers Free da Cloudflare            |
| Cloudflare Queues / Workers       | Opcional depois           | Só orquestração leve; não motor principal de jobs pesados |
| Kafka                             | **Não**                   | Overkill para este produto                                |
| RabbitMQ                          | Só se já existir na stack | Redis é mais simples para TypeScript puro                 |

### Porquê Redis + BullMQ

- Stack actual: Next.js no Dokploy + Neon
- Um contentor Redis (ou Redis gerido) basta no início
- API natural: `queue.add('whatsapp.reminder', { organizationId, ... }, { delay })`
- Escala para milhares de clínicas com jobs pequenos sem Kafka

### Cloudflare Queues — quando considerar

- Queres fila managed sem operar Redis
- O Worker **só enfileira / dispara HTTP** para a API Movi; o trabalho pesado fica no servidor
- Free: ~10 000 operações/dia; paid barato em volume clínico moderado
- **Não** processar Sharp/PDF pesado dentro do Worker Free

---

## 3. Forma de implementar (quando for a hora)

1. Extrair trabalho para funções de job, ex. `processManagedImageJob`, `sendAppointmentReminderJob`.
2. Manter API da app estável: actions chamam `enqueue(...)` ou, no início, a função directa.
3. Introduzir BullMQ:
   - `REDIS_URL`
   - `apps/worker` (processo separado no Dokploy) + `packages/shared` jobs
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
await enqueue("media.process", {
  kind: "avatar",
  userId /* ref ao upload temporário */,
});
```

---

## 4. Fora de escopo (por agora)

- Não adicionar Redis/BullMQ “por simetria” enquanto os jobs forem raros e síncronos couberem nas actions.
- Não migrar rate limit / sessão Better Auth para Redis só porque há fila — decisões separadas.

---

## 5. Checklist de activação

Alinhado a [`target-structure.md`](./target-structure.md):

- [x] Layout fase 1: `src/shared/lib/jobs` + `worker/` na raiz
- [x] Stub enqueue / worker idle sem `REDIS_URL` (paths podem ainda ser monorepo experimental)
- [ ] Redis no Dokploy (ou managed) + `REDIS_URL`
- [ ] `bullmq` + `ioredis` nas deps
- [ ] `pnpm worker` / processo worker no deploy
- [ ] Primeiro job real (provável: lembrete WhatsApp ou media)
- [ ] Ligar R2 se ainda estiver em disco local (`media-storage.md`)
- [ ] Monitorização básica (falhas, fila atrasada)
- [ ] (Fase 2) Com Fastify: mover jobs/shared/domains para `packages/` + `apps/api` / `apps/worker`
