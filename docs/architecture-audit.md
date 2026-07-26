# Auditoria de arquitectura

Estado consolidado dos refactors estruturais do Clinic System.

**Última revisão:** 25/07/2026  
**Referência normativa:** [`architecture.md`](./architecture.md)

## Resultado actual

- [x] Fronteiras automatizadas com `dependency-cruiser` (`pnpm arch`)
- [x] Sem imports entre features distintas
- [x] Sem imports das camadas internas para `app/`
- [x] `shared/` e `server/` sem dependências de features
- [x] `components/` sem dependências de features
- [x] Sem dependências circulares em `src/`
- [x] Prisma isolado em repositories dentro das features
- [x] Services sem `use server` nem invalidação de cache
- [x] UI partilhada movida para `features/[domínio]/components`
- [x] Orquestração multi-domínio feita em `app/`
- [x] Tipos finos partilhados no boundary (`PatientOption`, `PdfKeyValueSection`)

## Refactors concluídos

### P0 — Fronteiras críticas

- [x] Separação `repository → service → actions`
- [x] Eliminação de imports cruzados entre rotas `_components`
- [x] DTOs planos no boundary Server → Client
- [x] PDF multi-domínio composto em `app/`

### P1 — UI e dados

- [x] Leitura inicial em Server Components
- [x] Interacções client via actions e handlers
- [x] Componentes reutilizados promovidos para a feature correspondente
- [x] Formulários clínicos e catálogos organizados por domínio

### P4 — Higiene transversal

- [x] Dialogs sem efeitos para sincronizar props
- [x] Confirmação em acções destrutivas
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

## Verificação

Executar antes de integrar alterações estruturais:

```bash
pnpm arch
npx tsc --noEmit
pnpm test
```

Novos desvios devem ser corrigidos no código; não adicionar excepções à configuração sem decisão arquitectural documentada.
