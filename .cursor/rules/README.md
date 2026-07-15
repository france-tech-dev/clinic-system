# Regras Cursor (enxuto)

Documento de arquitectura para humanos: [`docs/architecture.md`](../docs/architecture.md)

## Ativas (~8 KB total)

| Ficheiro                     | Quando                                                   |
| ---------------------------- | -------------------------------------------------------- |
| `project-core.mdc`           | **Sempre** (stack, arquitetura, **padrão de estrutura**) |
| `route-shared-ui.mdc`        | **Sempre** (UI partilhada entre rotas)                   |
| `reuse-before-create.mdc`    | **Sempre** (evitar duplicação)                           |
| `react-effects-and-data.mdc` | **Sempre** (Server Components, useEffect)                |
| `frontend.mdc`               | Ficheiros `src/**/*.tsx`                                 |
| `nextjs-server-actions.mdc`  | `src/**/*.ts(x)`                                         |
| `ux.mdc`                     | UI / CSS                                                 |
| `middleware.mdc`             | `proxy.ts` / middleware                                  |
| `testing.mdc`                | Validação manual/E2E                                     |

## Tokens

- Antes: ~250 KB em quase todas as conversas
- Agora: ~2 KB sempre + regras por glob só ao editar ficheiros relevantes
