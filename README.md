# Project Boilerplate

Projeto interno de **Boilerplate**, desenvolvido em Next.js com autenticação (Better Auth), organizações multi-tenant e integração com a API da HotsCool.

## Visão geral

Aplicação web corporativa para gestão interna (dashboard, leads de matrícula UniAG, WhatsApp e relatórios). O acesso usa **e-mail/senha**, **Google** e **Microsoft Entra ID**, com suporte a **organizações**, papéis (RBAC) e verificação de e-mail via **Resend**.

## Stack tecnológica

| Tecnologia                 | Uso                                  |
| -------------------------- | ------------------------------------ |
| **Next.js 16**             | Framework React (App Router)         |
| **React 19**               | Interface                            |
| **TypeScript**             | Tipagem                              |
| **Better Auth**            | Autenticação, sessões e organizações |
| **Prisma 7**               | ORM (SQLite em desenvolvimento)      |
| **Tailwind CSS 4**         | Estilos                              |
| **shadcn/ui**              | Componentes de UI                    |
| **TanStack Query / Table** | Dados no cliente e tabelas           |
| **React Hook Form + Zod**  | Formulários e validação              |
| **Resend + React Email**   | E-mails transacionais                |
| **Axios**                  | Cliente HTTP para a APIs externas    |

## Funcionalidades atuais

- **Login com e-mail e senha** – cadastro, verificação de e-mail, recuperação e redefinição de senha
- **OAuth** – Google e Microsoft Entra ID
- **Organizações** – convites por e-mail, papéis (`ADMIN`, `OWNER`, `MANAGER`, `MEMBER`, `CLIENT`) e organização ativa na sessão
- **Área autenticada** – Dashboard, Cadastro UniAG (leads), WhatsApp e Relatórios
- **Integração HotsCool** – cliente HTTP em `src/API` (`NEXT_PUBLIC_API_URL`, `HOTSCOOL_X_ACCESS_TOKEN`)
- **Proteção de rotas** – lógica em `src/proxy.ts`

## Pré-requisitos

- **Node.js** 20+
- **pnpm** 10+ (o projeto define `packageManager` no `package.json`; use `corepack enable` se preferir)
- Conta **Resend** para envio de e-mails
- Credenciais OAuth (Google e/ou Microsoft Entra ID), conforme os provedores que for usar

## Como rodar o projeto

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# App / Better Auth
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="gere-um-secret-com-openssl-rand-base64-32"

# Banco (SQLite em desenvolvimento)
DATABASE_URL="file:./dev.db"

# E-mail (Resend)
RESEND_API_KEY="re_..."
EMAIL_NO_REPLY="noreply@seudominio.com"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Microsoft Entra ID (opcional)
AUTH_MICROSOFT_ENTRA_ID_ID=""
AUTH_MICROSOFT_ENTRA_ID_SECRET=""
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<tenant>/v2.0"

# API HotsCool
NEXT_PUBLIC_API_URL="https://api.exemplo.com"
HOTSCOOL_X_ACCESS_TOKEN=""
# NEXT_PUBLIC_MOCK_API="true"  # opcional, para mock em auth da API
```

Para gerar um secret:

```bash
openssl rand -base64 32
```

Detalhes de troubleshooting do login Microsoft: [`docs/auth-microsoft-entra-id.md`](docs/auth-microsoft-entra-id.md).

### 3. Banco de dados

O projeto usa **SQLite** (`dev.db`) em desenvolvimento. Para gerar o client e sincronizar o schema:

```bash
pnpm exec prisma generate
pnpm exec prisma db push
# ou, com migrations:
# pnpm exec prisma migrate dev
```

### 4. Servidor de desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000). A rota de login padrão é `/auth/login`.

## Scripts disponíveis

| Comando      | Descrição                                     |
| ------------ | --------------------------------------------- |
| `pnpm dev`   | Sobe o servidor de desenvolvimento            |
| `pnpm build` | Gera o Prisma Client e faz o build do Next.js |
| `pnpm start` | Sobe a aplicação em produção                  |
| `pnpm lint`  | Executa o ESLint                              |

## Estrutura do projeto (resumo)

```
src/
├── app/
│   ├── (authenticated)/          # Dashboard, leads, WhatsApp, relatórios
│   ├── (not-authenticated)/auth/ # Login, signup, magic link, reset password
│   ├── api/
│   │   ├── auth/                 # Route handlers de autenticação
│   │   └── accept-invitation/    # Aceite de convite de organização
│   ├── logout/
│   └── providers/
├── API/                          # Cliente Axios e integrações (HotsCool, leads)
├── components/
│   ├── auth/                     # Formulários e fluxos de autenticação
│   ├── emails/                   # Templates React Email
│   ├── templates/                # Sidebar, header, theme
│   └── ui/                       # shadcn/ui
├── lib/
│   ├── auth.ts                   # Configuração Better Auth
│   ├── auth-client.ts            # Client Better Auth (React)
│   ├── auth/permissions.ts       # Access control / papéis
│   ├── paths.ts                  # Rotas centralizadas
│   └── prisma.ts                 # Cliente Prisma
├── server/
│   ├── auth/                     # getCurrentUser, signIn, signUp, reset
│   └── organizations/            # Organizações e membros
├── resources/                    # Itens da sidebar, etc.
└── proxy.ts                      # Proteção / redirecionamento de rotas
prisma/
├── schema.prisma
└── generated/                    # Prisma Client gerado
```

## Autenticação

Configuração em `src/shared/lib/auth.ts` (servidor) e `src/shared/lib/auth-client.ts` (cliente).

| Método             | Estado                                     |
| ------------------ | ------------------------------------------ |
| E-mail e senha     | Ativo (verificação de e-mail obrigatória)  |
| Google             | Ativo (requer `GOOGLE_CLIENT_*`)           |
| Microsoft Entra ID | Ativo (requer `AUTH_MICROSOFT_ENTRA_ID_*`) |
| Organizações       | Plugin Better Auth + e-mails de convite    |

Fluxos de UI:

- `/auth/login` – e-mail/senha e OAuth
- `/auth/signup` – cadastro
- `/auth/forgot-password` e `/auth/reset-password` – recuperação de senha
- `/auth/login-link` – página de magic link (legado / alternativa)
- `/logout` – encerramento de sessão

## Licença

Licença proprietária – **NOME DA EMPRESA AQUI**. Ver [`LICENSE`](LICENSE).
