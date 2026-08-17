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

- Driver actual: **local** → `public/uploads/...`
- Logo em `/configuracoes` já passa por `processImageToWebp` + storage

## Ligar Cloudflare R2

1. `pnpm add @aws-sdk/client-s3`
2. Em `src/shared/lib/media/r2-object-storage.ts`, descomentar `put` / `deleteByUrl`
3. Env:

```bash
OBJECT_STORAGE_DRIVER=r2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=https://seu-dominio-ou-r2-dev
```

4. Reiniciar o servidor. Sem `OBJECT_STORAGE_DRIVER=r2`, continua em disco local.

## PDF + WebP

Validar `@react-pdf/renderer` com logo WebP. Se falhar, gerar PNG derivado só para PDF (mantém WebP na UI).

## Filas (quando o sync deixar de chegar)

Ver [`jobs-queues.md`](./jobs-queues.md) — decisão: Redis + BullMQ; media pode continuar síncrona até doer.
