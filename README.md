# Fichário TO

Sistema clínico para **Terapia Ocupacional**: biblioteca de atividades terapêuticas, prontuário de pacientes, agenda, notas de estudo e painel da clínica — com isolamento por organização (multi-tenant).

## Stack

| Tecnologia         | Uso                                      |
| ------------------ | ---------------------------------------- |
| **Next.js 16**     | App Router + Server Actions              |
| **React 19**       | Interface                                |
| **TypeScript**     | Tipagem                                  |
| **Better Auth**    | Autenticação e organizações multi-tenant |
| **Prisma 7**       | ORM (SQLite em desenvolvimento)          |
| **Tailwind CSS 4** | Estilos                                  |
| **shadcn/ui**      | Componentes                              |
| **Zod**            | Validação nas Server Actions             |
| **Resend**         | E-mails (verificação, reset, convites)   |

## Funcionalidades

- **Painel** (`/painel`) — estatísticas, alertas clínicos e atividade recente
- **Agenda** (`/agenda`) — agendamentos por dia (status, duração, notas)
- **Biblioteca** (`/biblioteca`) — catálogo de atividades terapêuticas por domínio (CRUD)
- **Estudo** (`/estudo`) — cartões de estudo / referência clínica
- **Pacientes** (`/pacientes`) — cadastro, status, plano de atividades, avaliação por domínios, anamnese pediátrica, evoluções de sessão e roteiros
- **Busca** (`/buscar`) — pesquisa rápida na clínica
- **Configurações** (`/configuracoes`) — perfil profissional
- **Organização** (`/organizacao`) — gestão da clínica e membros
- **Multi-tenant** — dados isolados por `organizationId`

## Pré-requisitos

- Node.js 20+
- pnpm 10+
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
pnpm exec prisma db push
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) — login em `/auth/login`.

## Estrutura

```
src/
├── app/
│   ├── (authenticated)/   # painel, agenda, biblioteca, estudo, pacientes, …
│   ├── (not-authenticated)/auth/
│   └── api/
├── features/
│   ├── dashboard/         # painel e busca
│   ├── exercise/          # biblioteca de atividades
│   ├── patient/           # prontuário
│   ├── schedule/          # agenda
│   ├── study/             # cartões de estudo
│   └── settings/          # configurações
├── components/            # UI e templates
├── shared/                # auth, prisma, constants, guards, permissions
└── server/                # helpers de auth e organizações
```

Cada feature segue o padrão `repository` → `service` → `actions` (Zod + revalidação). Features **não** importam entre si; código comum fica em `shared/`.

## Scripts

| Comando     | Descrição                          |
| ----------- | ---------------------------------- |
| `pnpm dev`  | Servidor de desenvolvimento        |
| `pnpm build`| `prisma generate` + build Next.js  |
| `pnpm start`| Servidor de produção               |
| `pnpm lint` | ESLint                             |

## Licença

Projeto privado / proprietário.
