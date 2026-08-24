---
name: Movi Clinicas
description: Gestão clínica multi-tenant — Operate claro, denso e confiável em PT-BR.
colors:
  background: "oklch(0.965 0.02 82)"
  foreground: "oklch(0.145 0.01 55)"
  card: "oklch(0.985 0.012 82)"
  primary: "oklch(58.813% 0.11371 171.371 / 0.781)"
  primary-foreground: "oklch(0.975 0.01 82)"
  secondary: "oklch(0.935 0.022 82)"
  muted: "oklch(0.935 0.022 82)"
  muted-foreground: "oklch(0.48 0.025 55)"
  border: "oklch(0.875 0.024 78)"
  destructive: "oklch(0.577 0.245 27.325)"
  ring: "oklch(0.68 0.028 70)"
  sidebar: "oklch(0.95 0.022 82)"
typography:
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "calc(0.625rem - 4px)"
  md: "calc(0.625rem - 2px)"
  lg: "0.625rem"
  xl: "calc(0.625rem + 4px)"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1rem"
---

# Design System: Movi Clinicas

## Overview

**Creative North Star: "O Fichário Clínico"**

A Movi é um sistema Operate para clínicas multi-profissionais: o ecrã deve ler-se como um fichário de consultório — papel creme, tinta escura, acento clínico contido — não como um dashboard SaaS genérico. Densidade alta o suficiente para o turno (agenda, paciente, avaliações), com hierarquia clara e copy em português do Brasil.

A personalidade é **confiável e directa**: tokens semânticos Shadcn (`background`, `primary`, `muted`), tipografia serif só em títulos de secção/card, e acções destrutivas sempre confirmadas. Rejeita-se o “kit de landing” (eyebrows, gradient text, glass decorativo, grelhas de cards ícone+texto).

**Key Characteristics:**

- Modo Operate: scanability e estados reais (vazio, loading, erro) > expressão
- Superfícies creme quentes no light; dark zinc neutro
- Primary teal-esverdeado clínico (não purple-on-white)
- `AppPage` + Shadcn radix-nova + Tabler/Lucide conforme o sítio
- Documentos clínicos (PDF) e identidade profissional fazem parte do produto

## Colors

Paleta semântica via CSS variables em `src/app/globals.css` (fonte normativa). Preferir classes Tailwind semânticas (`bg-background`, `text-primary`) a hex soltos.

### Primary

- **Teal clínico** (`oklch(58.813% 0.11371 171.371 / 0.781)`): CTAs, links activos, tabs seleccionadas, destaques de acção. Usar com parcimónia — raridade = hierarquia.

### Neutral

- **Papel creme** (`oklch(0.965 0.02 82)`): fundo da app no light.
- **Tinta** (`oklch(0.145 0.01 55)`): texto principal.
- **Cartão** (`oklch(0.985 0.012 82)`): superfícies elevadas / cards.
- **Muted** (`oklch(0.935 0.022 82)` / texto `oklch(0.48 0.025 55)`): secundário, meta, placeholders.
- **Linha** (`oklch(0.875 0.024 78)`): bordas e inputs.

### Destructive

- **Alerta clínico** (`oklch(0.577 0.245 27.325)`): remover, revogar com confirmação — nunca como cor decorativa.

### Named Rules

**The Semantic Token Rule.** Novas UIs usam tokens Shadcn (`primary`, `muted-foreground`, `border`). Não inventar paletas paralelas nem hardcodar `bg-white` / `text-gray-*`.

**The One Accent Rule.** O primary ocupa pouco do ecrã; o resto é papel, tinta e linha.

## Typography

**Display / Title Font:** Georgia (via `.font-serif`) — títulos de card, dialog e secção.  
**Body Font:** Inter (`--font-sans`).  
**Mono Font:** Geist Mono — dados tabulares, códigos, horas quando fizer sentido.

**Character:** Serif só para dar peso de “documento clínico” em headings; o corpo fica Inter limpo para leitura densa no turno.

### Hierarchy

- **Headline** (serif, ~1.5–2rem, semibold): títulos de página / blocos grandes (dashboard, planos).
- **Title** (serif, ~1.125rem, semibold): `CardTitle`, `DialogTitle`.
- **Body** (sans, 0.875rem): conteúdo e formulários.
- **Label** (sans, 0.75rem): meta, badges, captions — sentence case, evitar ALL CAPS salvo badges de estado curtos.

### Named Rules

**The Serif Title Rule.** Serif em títulos de superfície; nunca em botões, inputs ou navegação densa.

## Layout

- Shell autenticado: `AppPage` (header + área scroll com `px-4 lg:px-6`, ritmo `gap-4` / `md:gap-6`).
- Listas e hubs: grelha responsiva (`sm:grid-cols-2`, `xl:grid-cols-3`) sem forçar cards decorativos.
- Workspaces clínicos densos: `ClinicalWorkspaceShell` — uma secção activa + footer fixo (Cancelar / Salvar).
- Altura: `dvh` / `svh` conforme `ux.mdc`; nunca `vh` em overlays.

## Elevation & Depth

Sistema **flat-by-default** com borda e fundo tonal. Sombras leves só em hover de card (`hover:shadow-md`) ou overlays (dialog/sheet/popover) — profundidade estrutural, não glow.

### Named Rules

**The Flat-By-Default Rule.** Superfície em repouso = border + card/background. Sombra = estado (hover, elevação, overlay).

## Shapes

- Raio base `--radius: 0.625rem` (sm/md/lg derivados).
- Cards e sheets: `rounded-xl` / radius do design system.
- Chips de filtro: `rounded-full` quando o padrão local já o usa (filtros de lista).
- Evitar pills decorativos sem acção.

## Components

### Buttons

- **Shape:** radius do sistema (~0.625rem).
- **Primary / Outline / Ghost / Destructive:** variantes Shadcn `Button`.
- **Ícones:** `data-icon="inline-start|inline-end"`; Tabler no design system, Lucide onde o domínio já usa.
- Destrutivo com confirmação (`DeleteConfirmDialog` ou AlertDialog quando a acção não é “excluir permanente”).

### Cards / Containers

- Border `border-border`, fundo `bg-card`, padding interno confortável.
- Cards só quando contêm interacção ou agrupamento real — não como grelha de marketing.

### Inputs / Fields

- Sempre Shadcn (`Input`, `Select`/`NativeSelect`, `Checkbox`, …).
- Forms: RHF + Zod + `FormMessage`; obrigatórios com `*` no label.
- Datas: `DatePicker` — nunca `type="date"`.

### Navigation

- Sidebar Shadcn; tabs de paciente = underline `border-primary` no activo.
- Hub de avaliações/anamneses: `ProfessionCatalogCard` com preview limitado + “Ver mais”.

### Signature: Clinical workspace

Índice de secções + painel único + footer fixo. Não empilhar todas as secções num scroll longo.

## Do's and Don'ts

### Do:

- **Do** seguir `AppPage`, tokens semânticos e padrões de rota semelhante antes de inventar layout.
- **Do** empty states com próxima acção (ex. “Novo link”) quando o utilizador pode criar.
- **Do** confirmar acções que invalidam links ou apagam dados.
- **Do** copy PT-BR alinhada ao domínio (paciente, responsável, instrumento, evolução).

### Don't:

- **Don't** criar design system paralelo ao Shadcn / `globals.css`.
- **Don't** usar eyebrow/kicker, gradient text, glass decorativo ou cards ícone+texto como estrutura da página.
- **Don't** ejectar o utilizador do contexto do paciente sem necessidade (preferir dialog/preview in-place quando o fluxo for clínico).
- **Don't** hardcodar `vh` em modais/drawers.
