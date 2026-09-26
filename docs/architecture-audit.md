# Auditoria de arquitetura

Estado consolidado dos refactors estruturais do Clinic System.

**Última revisão:** 26/09/2026  
**Referência normativa:** [`architecture.md`](./architecture.md) · rules: [`.cursor/rules/README.md`](../.cursor/rules/README.md)

## Resultado atual

- [x] Fronteiras automatizadas com `dependency-cruiser` (`pnpm arch`)
- [x] Sem imports entre features distintas
- [x] Sem imports das camadas internas para `app/`
- [x] `shared/` e `platform/` (`@/server`) sem dependências de `domains/` / `features/`
- [x] `ui/` (`@/components`) sem dependências de `domains/` / `features/`
- [x] Sem dependências circulares em `src/`
- [x] Prisma isolado em repositories dentro de `domains/`
- [x] Services sem `use server` nem invalidação de cache
- [x] UI partilhada em `features/[domínio]/` (≥2 rotas)
- [x] Orquestração multi-domínio em `app/` (+ `application/patient` para escrita composta)
- [x] Tipos finos partilhados no boundary (`PatientOption`, `PdfKeyValueSection`)

## Refactors concluídos

### P0 — Fronteiras críticas

- [x] Separação `repository → service → actions`
- [x] Eliminação de imports cruzados entre rotas `_components`
- [x] DTOs planos no boundary Server → Client
- [x] PDF multi-domínio composto em `app/` / `application/`

### P1 — UI e dados

- [x] Leitura inicial em Server Components
- [x] Interações client via actions e handlers
- [x] Componentes reutilizados promovidos para a feature correspondente
- [x] Formulários clínicos e catálogos organizados por domínio

### P4 — Higiene transversal

- [x] Dialogs sem efeitos para sincronizar props
- [x] Confirmação em ações destrutivas
- [x] Migration Prisma baseline versionada
- [x] Dependências circulares eliminadas e bloqueadas
- [x] Actions e schemas sem consumidores removidos
- [x] Fixture clínica de demonstração fora de `shared/`

### P6 — Multi-profissional

- [x] P6.0 — auditoria do domínio e definição do modelo
- [x] P6.1 — profissional associado ao agendamento
- [x] P6.2 — filtro de agenda por profissional
- [x] P6.3 — caixa e relatório por profissional
- [x] P6.4 — autoria em avaliações e evoluções
- [x] P6.5 — tipos partilhados, preço do paciente e migration baseline
- [x] Autor de protocolo e assinatura PDF com fallback da organização

## Notas

- `application/` existe só para `patient` — não expandir sem 2.º caso real.
- Jobs: infra BullMQ + `consumer/` pronta; `produce()` ainda sem callers; media síncrona; WhatsApp = stub.
- Rules Cursor: `reuse-before-create` / `clean-architecture` / `route-shared-ui` fundidas em `ponytail` + `project-core`.

## Verificação

```bash
pnpm arch
npx tsc --noEmit
pnpm test
```

Novos desvios devem ser corrigidos no código; não adicionar exceções à configuração sem decisão arquitetural documentada.
