# CLINIC SYSTEM - Movi

Sistema de gestão clínica multi-tenant para clínicas de saúde (Terapia Ocupacional e equipas multi-profissionais): prontuário, agenda, anamnese, avaliações estruturadas, caixa e painel — com isolamento por organização.

**Em produção:** [https://movi-clinicas.francetech.com.br](https://movi-clinicas.francetech.com.br) — já em uso por profissionais.

## Stack

| Tecnologia              | Uso                                         |
| ----------------------- | ------------------------------------------- |
| **Next.js 16**          | App Router + Server Actions                 |
| **React 19**            | Interface                                   |
| **TypeScript**          | Tipagem                                     |
| **Better Auth**         | Autenticação, organizações e convites       |
| **Prisma 7**            | ORM (PostgreSQL)                            |
| **Tailwind CSS 4**      | Estilos                                     |
| **shadcn/ui**           | Componentes                                 |
| **Zod**                 | Validação nas Server Actions                |
| **Brevo (SMTP)**        | E-mails (verificação, reset, convites)      |
| **@react-pdf/renderer** | Relatórios PDF (prontuário, anamnese, etc.) |
| **react-big-calendar**  | Vista de calendário na agenda               |
| **Vitest**              | Testes unitários                            |

## Funcionalidades

- **Painel** (`/painel`) — estatísticas, alertas clínicos, faturamento do mês e atividade recente
- **Agenda** (`/agenda`) — lista + calendário, drag-and-drop, repetição semanal, filtro por profissional
- **Pacientes** (`/pacientes`) — cadastro, responsáveis, preço/sessão ou pacote, evoluções e PDF do prontuário
- **Anamnese** (`/anamnese`) — hub por especialidade (formulários filtrados pelas profissões activas da clínica)
- **Avaliações** (`/avaliacoes`) — protocolos estruturados (ex.: GMFM-88)
- **Caixa** (`/caixa`) — entradas/saídas, resumo mensal, filtro por profissional; sugestão ao marcar agendamento como realizado
- **Profissionais** (`/profissionais`) — equipa da clínica (profissão, status)
- **Perfil** (`/perfil`) — dados do profissional (editáveis) e consulta de profissão, papel e pacientes
- **Configurações** (`/configuracoes`) — identidade da clínica (nome, logo, assinatura padrão); liderança
- **Organização** (`/organizacao`) — gestão da clínica e membros
- **Portal do responsável** (`/portal`) — stub para `Role.CLIENT` (em evolução)
- **Multi-tenant** — dados isolados por `organizationId`

## Pré-requisitos

- Node.js 20+
- pnpm 11+
- Conta [Brevo](https://www.brevo.com) (e-mails via SMTP)
- Credenciais Google OAuth

## Como rodar

```bash
pnpm install
```

Crie um ficheiro `.env` na raiz (validadas em `src/shared/env.ts` no boot):

```env
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="gere-um-secret-com-openssl-rand-base64-32"
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/clinic_system"

# Brevo SMTP (Settings → SMTP & API)
BREVO_SMTP_USER="o-login-smtp-do-brevo"
BREVO_SMTP_KEY="a-chave-smtp-do-brevo"
EMAIL_NO_REPLY="noreply@seudominio.com"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Pool Postgres (opcional; default 10)
# DATABASE_POOL_MAX="10"

# Stripe Billing (produção — restricted key)
# STRIPE_SECRET_KEY="rk_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
# STRIPE_PRICE_STARTER="price_..."
# STRIPE_PRICE_PRO="price_..."
# STRIPE_PRICE_ENTERPRISE="price_..."

# IA — interpretação de protocolos (opcional; ver docs/ai.md)
# AI_PROVIDER="google"
# GOOGLE_GENERATIVE_AI_API_KEY="..."
# AI_MODEL="gemini-2.5-flash"
# AI_PROVIDER="openai"
# OPENAI_API_KEY="sk-..."
# AI_MODEL="gpt-5-mini"

# Staff de plataforma — acesso a /plataforma (user ids separados por vírgula)
# PLATFORM_ADMIN_USER_IDS="user_id_1,user_id_2"
```

Obrigatórias no boot: `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.  
Brevo, Stripe, R2 e OpenAI são opcionais até serem usados (R2 exige o bloco completo se `OBJECT_STORAGE_DRIVER=r2`).

```bash
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) — login em `/auth/login`.

Opcional, após criar a conta/organização:

```bash
pnpm db:seed
```

## Segurança (rate limit)

- **Better Auth** — contadores em Postgres (`RateLimit`), para partilhar limites entre réplicas Docker. Defaults nos endpoints sensíveis (sign-in, reset, etc.); `/get-session` sem throttle.
- **Accept invitation** — `assertRateLimit` na rota pública `/api/accept-invitation/[invitationId]`.
- Em produção (Traefik), Better Auth usa `X-Real-IP` via `advanced.ipAddress` (mesmo critério que `getRequestClientIp`).

Validar localmente ou em staging:

```bash
pnpm validate:rate-limit -- --url http://127.0.0.1:3000
# duas réplicas (contador partilhado na BD):
pnpm validate:rate-limit -- --a http://127.0.0.1:3001 --b http://127.0.0.1:3002
```

## Estrutura

```
src/
├── app/
│   ├── (authenticated)/   # painel, agenda, pacientes, anamnese, avaliações, caixa, …
│   ├── (not-authenticated)/auth/
│   ├── (portal)/          # portal do responsável
│   └── api/
├── features/
│   ├── anamnese/          # formulários por especialidade
│   ├── dashboard/         # painel e busca
│   ├── finance/           # fluxo de caixa
│   ├── guardian/          # responsáveis / Role.CLIENT
│   ├── patient/           # prontuário, evoluções, PDF
│   ├── protocol/          # avaliações estruturadas (ex.: GMFM-88)
│   ├── schedule/          # agenda
│   ├── settings/          # configurações / branding
│   └── team/              # profissionais
├── components/            # UI genérica (shadcn, auth, templates)
├── shared/                # prisma, auth, constants, guards, types
├── server/                # helpers Better Auth (sessão, org, convites)
└── hooks/                 # hooks globais
```

Cada feature segue `repository` → `service` → `actions` (Zod + revalidação). Features **não** importam entre si; orquestração em `app/`; código comum em `shared/`.

Documentação detalhada: [`docs/architecture.md`](docs/architecture.md) · roadmap: [`docs/ToDo.md`](docs/ToDo.md) · testes: [`tests/README.md`](tests/README.md).

## Scripts

| Comando                    | Descrição                                     |
| -------------------------- | --------------------------------------------- |
| `pnpm dev`                 | Servidor de desenvolvimento                   |
| `pnpm build`               | `prisma generate` + build Next.js             |
| `pnpm start`               | Servidor de produção                          |
| `pnpm lint`                | ESLint + verificação de arquitectura (`arch`) |
| `pnpm arch`                | Fronteiras de import (dependency-cruiser)     |
| `pnpm test`                | Testes unitários (Vitest)                     |
| `pnpm test:watch`          | Vitest em modo watch                          |
| `pnpm db:migrate`          | Aplica migrations (`prisma migrate deploy`)   |
| `pnpm db:seed`             | Seed (paciente de demonstração)               |
| `pnpm validate:rate-limit` | Probe de rate limit (auth / réplicas)         |

## Deploy (Dokploy)

Build Type: **Dockerfile**. No arranque do contentor corre `prisma migrate deploy` e depois `node server.js` (ver `docker-entrypoint.sh`).

Usa a URL **Internal** da BD nas envs da app. Podes desactivar a porta External no Postgres se já não precisares dela.

Com **várias réplicas**, o rate limit em database é obrigatório (já configurado) — storage em memória não partilha contadores entre processos.

## Licença

Projeto privado / proprietário.
