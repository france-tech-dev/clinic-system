# Neuro France

Sistema de gestão clínica multi-tenant para clínicas de saúde (Terapia Ocupacional e equipas multi-profissionais): prontuário, agenda, anamnese, avaliações estruturadas, caixa e painel — com isolamento por organização.

## Stack

| Tecnologia              | Uso                                              |
| ----------------------- | ------------------------------------------------ |
| **Next.js 16**          | App Router + Server Actions                      |
| **React 19**            | Interface                                        |
| **TypeScript**          | Tipagem                                          |
| **Better Auth**         | Autenticação, organizações e convites            |
| **Prisma 7**            | ORM (SQLite em desenvolvimento; Postgres pronto) |
| **Tailwind CSS 4**      | Estilos                                          |
| **shadcn/ui**           | Componentes                                      |
| **Zod**                 | Validação nas Server Actions                     |
| **Resend**              | E-mails (verificação, reset, convites)           |
| **@react-pdf/renderer** | Relatórios PDF (prontuário, anamnese, etc.)      |
| **react-big-calendar**  | Vista de calendário na agenda                    |
| **Vitest**              | Testes unitários                                 |

## Funcionalidades

- **Painel** (`/painel`) — estatísticas, alertas clínicos, faturamento do mês e atividade recente
- **Agenda** (`/agenda`) — lista + calendário, drag-and-drop, repetição semanal, filtro por profissional
- **Pacientes** (`/pacientes`) — cadastro, responsáveis, preço/sessão ou pacote, evoluções e PDF do prontuário
- **Anamnese** (`/anamnese`) — hub por especialidade (formulários filtrados pelas profissões activas da clínica)
- **Avaliações** (`/avaliacoes`) — protocolos estruturados (ex.: GMFM-88)
- **Caixa** (`/caixa`) — entradas/saídas, resumo mensal, filtro por profissional; sugestão ao marcar agendamento como realizado
- **Profissionais** (`/profissionais`) — equipa da clínica (profissão, status)
- **Busca** (`/buscar`) — pesquisa rápida na clínica
- **Configurações** (`/configuracoes`) — perfil e identidade da clínica (nome, logo)
- **Organização** (`/organizacao`) — gestão da clínica e membros
- **Portal do responsável** (`/portal`) — stub para `Role.CLIENT` (em evolução)
- **Multi-tenant** — dados isolados por `organizationId`

## Pré-requisitos

- Node.js 20+
- pnpm 11+
- Conta [Resend](https://resend.com) (e-mails)
- Credenciais Google OAuth (opcional)

## Como rodar

```bash
pnpm install
```

Crie um ficheiro `.env` na raiz:

```env
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="gere-um-secret-com-openssl-rand-base64-32"
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="re_..."
EMAIL_NO_REPLY="noreply@seudominio.com"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

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

| Comando           | Descrição                                     |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Servidor de desenvolvimento                   |
| `pnpm build`      | `prisma generate` + build Next.js             |
| `pnpm start`      | Servidor de produção                          |
| `pnpm lint`       | ESLint + verificação de arquitectura (`arch`) |
| `pnpm arch`       | Fronteiras de import (dependency-cruiser)     |
| `pnpm test`       | Testes unitários (Vitest)                     |
| `pnpm test:watch` | Vitest em modo watch                          |
| `pnpm db:seed`    | Seed (paciente de demonstração)               |

## Licença

Projeto privado / proprietário.
