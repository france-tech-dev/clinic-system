# Media / object storage

Política de ficheiros de imagem (logo, avatares):

| Tipo                  | Formato | Tamanho           |
| --------------------- | ------- | ----------------- |
| Avatar (`User.image`) | WebP    | 256×256 (crop)    |
| Logo da clínica       | WebP    | lado maior ≤ 1024 |

## Uso na app

```ts
import {
  saveOrganizationLogoImage,
  saveUserAvatarImage,
  deleteManagedImage,
} from "@/shared/lib/media";
```

- Driver default: **local** → `public/uploads/...`
- Com `OBJECT_STORAGE_DRIVER=r2` → Cloudflare R2 (mesmo contrato `ObjectStorage`)
- Logo em `/configuracoes` já passa por `processImageToWebp` + storage
- Plataforma (`/plataforma`): botão **Limpar órfãos** — apaga `uploads/` sem referência em `Organization.logo` / `User.image`

## Ligar Cloudflare R2

Dependência: `@aws-sdk/client-s3` (já no projecto).

### 1. Credenciais (API S3)

No dashboard Cloudflare → R2 → **Manage R2 API Tokens** → token com Object Read & Write no bucket.

O **endpoint S3** (`https://{accountId}.r2.cloudflarestorage.com`) serve **só** ao SDK (Put/Delete). **Não** é URL pública de imagens.

| Variável                                    | Exemplo                                          |
| ------------------------------------------- | ------------------------------------------------ |
| `R2_ACCOUNT_ID`                             | `119133eacf7b9dd1454ac2124737a0c5`               |
| `R2_BUCKET`                                 | `movi-clinicas`                                  |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | do API token                                     |
| `R2_PUBLIC_BASE_URL`                        | `https://r2.francetech.com.br` (sem barra final) |

### 2. Domínio público (obrigatório para o browser)

**Não** criar um CNAME manual para `*.r2.cloudflarestorage.com` — isso aponta para a API autenticada, não para servir ficheiros.

Passos correctos:

1. R2 → bucket (`movi-clinicas`) → **Settings** → **Custom Domains**
2. Adicionar `r2.francetech.com.br` (domínio na mesma conta Cloudflare)
3. A Cloudflare liga o hostname ao bucket e gere o DNS

Alternativa rápida: **Public Development URL** (`https://pub-….r2.dev`) → usar essa URL em `R2_PUBLIC_BASE_URL`.

URLs gravadas na BD ficam no formato:

`https://r2.francetech.com.br/uploads/organizations/{id}/logo.webp`

### 3. Env

```bash
OBJECT_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=119133eacf7b9dd1454ac2124737a0c5
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=movi-clinicas
R2_PUBLIC_BASE_URL=https://r2.francetech.com.br
```

Reiniciar o servidor. Sem `OBJECT_STORAGE_DRIVER=r2`, continua em disco local.

## PDF + WebP

Validar `@react-pdf/renderer` com logo WebP. Se falhar, gerar PNG derivado só para PDF (mantém WebP na UI).

## Filas (quando o sync deixar de chegar)

Ver [`jobs-queues.md`](./jobs-queues.md) — decisão: Redis + BullMQ; media pode continuar síncrona até doer.
