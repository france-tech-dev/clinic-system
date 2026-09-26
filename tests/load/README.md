# Testes de carga (k6)

Alvo preferido: **staging Dokploy**. O gerador k6 corre no teu host (fora dos resources da VM).

Produção (`movi-clinicas.francetech.com.br`) é **recusada por defeito**. Só passa com `K6_ALLOW_PROD=1` no `.env` (opt-in consciente).

## Pré-requisitos

1. [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) instalado (`k6 version`)
   - Windows: [releases](https://github.com/grafana/k6/releases) → `k6-*-windows-amd64.zip`, extrair `k6.exe` para um diretório no `PATH`
2. Alvo healthy (login manual no browser)
3. Utilizador com email/password
4. Variáveis no `.env` (lidas via `scripts/run-k6.mjs`):

| Variável        | Obrigatória | Default                  | Notas                                            |
| --------------- | ----------- | ------------------------ | ------------------------------------------------ |
| `BASE_URL`      | sim         | —                        | URL pública (sem barra final)                    |
| `K6_EMAIL`      | não         | `fisio.demo@example.com` | Conta com acesso às páginas clínicas             |
| `K6_PASSWORD`   | não         | `DemoMovi2026!`          | Senha demo do seed                               |
| `K6_PATIENT_ID` | não         | —                        | Se definido, inclui `GET /pacientes/{id}`        |
| `K6_ALLOW_PROD` | não         | —                        | `1` / `true` para permitir `BASE_URL` = produção |

## Como criar staging no Dokploy

1. **Neon** — branch ou projeto novo (não o da prod). Copia a connection string (pooler).
2. **Dokploy** — Application nova (ou clone da prod): mesmo repo/`Dockerfile`, env à parte.
3. **Redis** — serviço Redis só de staging; `REDIS_URL` apontando para ele.
4. **Domínio** — ex. `movi-stage.francetech.com.br` no serviço + DNS A/CNAME para o VPS (Cloudflare: proxy ok com SSL Full/Strict).
5. **Envs críticas** (valores **diferentes** da prod):
   - `BETTER_AUTH_URL` = URL pública do staging (igual ao domínio)
   - `BETTER_AUTH_SECRET` novo
   - `DATABASE_URL` = Neon staging
   - `REDIS_URL` = Redis staging
   - Stripe: `sk_test` / webhook test, ou omitir
6. Deploy → abrir `/auth/login` no browser (não pode ser 404 Traefik).
7. Criar conta/org no staging + `pnpm db:seed` (com `DATABASE_URL` do staging) se quiseres dados demo.
8. No `.env` local: `BASE_URL=https://movi-stage…` (sem `K6_ALLOW_PROD`).

Enquanto o staging não existir, podes apontar a prod com opt-in:

```env
BASE_URL="https://movi-clinicas.francetech.com.br"
K6_ALLOW_PROD=1
K6_EMAIL="..."
K6_PASSWORD="..."
```

## Comandos

```bash
# Lê BASE_URL / K6_* do .env
pnpm test:load:smoke
pnpm test:load
pnpm test:load:stress
```

## Cenários

| Script      | VUs         | Duração | Thresholds (resumo) |
| ----------- | ----------- | ------- | ------------------- |
| `smoke.js`  | 2           | 30s     | fail <5%, p95 <3s   |
| `load.js`   | rampa → 15  | ~4 min  | fail <10%, p95 <5s  |
| `stress.js` | rampa → 150 | ~8 min  | fail <40%, p95 <15s |

Mix autenticado (após **um** login no `setup`):

- `GET /agenda`, `GET /pacientes`, `GET /pacientes/{id}` (se `K6_PATIENT_ID`)
- `GET /api/auth/get-session`
- ocasionalmente `/dashboard` e `/caixa` (403/redirect tolerados)

**Fora de escopo:** `/api/ai/*`, Stripe webhook, convites públicos, martelar sign-in.

## Interpretação

- Smoke vermelho → auth, `BETTER_AUTH_URL`, seed ou alvo em baixo / DNS.
- Load: p95 e taxa de erro sobem → pool Postgres (`DATABASE_POOL_MAX`), CPU da VM ou Redis.
- Stress: esperado degradar; anota em que VU a app/Postgres saturam no Dokploy.
