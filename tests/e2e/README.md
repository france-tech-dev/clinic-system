# E2E — Playwright (pendente)

Pasta reservada para testes end-to-end no browser.

## Setup futuro

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

Criar `playwright.config.ts` na raiz apontando `testDir: "./tests/e2e"`.

Script em `package.json`:

```json
"test:e2e": "playwright test"
```

## Fluxos prioritários

1. Auth — login e acesso ao painel
2. Pacientes — criar e abrir detalhe
3. Agenda — novo agendamento na lista
4. Caixa — lançamento após sessão realizada

## Notas

- Correr com `pnpm dev` ou `webServer` no config Playwright
- Usar base de dados de teste isolada (SQLite em memória ou seed dedicado)
- Não misturar specs E2E com unitários em `tests/unit/`
