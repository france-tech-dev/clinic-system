---
name: Movi Clinicas
description: Gestão clínica multi-tenant — Operate claro no app; Persuade na landing com ritmo Origin e dual-theme.
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
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.08
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
  "3xl": "1.5rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  section: "5rem"
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
  landing-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.3xl}"
    padding: "1.5rem"
  landing-nav-pill:
    backgroundColor: "rgb(255 255 255 / 0.4)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "0.625rem"
---

# Design System: Movi Clinicas

## Overview

**Creative North Star: "O Fichário Clínico"**

A Movi é um sistema Operate para clínicas multi-profissionais: o ecrã autenticado deve ler-se como um fichário de consultório — papel creme, tinta escura, acento clínico contido — não como um dashboard SaaS genérico. Densidade alta o suficiente para o turno (agenda, paciente, avaliações), com hierarquia clara e copy em português do Brasil.

A **landing pública** (`/`, `src/app/(marketing)/`) é Persuade no **mesmo sistema de tokens**, com **ritmo tipo Origin**: hero → showcase (mockup) → grelha de produto → prova dual → capacidades honestas → planos → CTA circular → footer. Dual-theme via `ThemeSwitcher` / `next-themes`: light = fichário creme/teal; dark = zinc premium. Mockups usam `MediaPlaceholder` até existirem assets reais. Sem purple-glow SaaS, sem testemunhos inventados, sem claims de portal/WhatsApp como entregues.

A personalidade é **confiável e directa**: tokens semânticos Shadcn, tipografia serif nos títulos, acções destrutivas confirmadas. No app rejeita-se o “kit de landing” (eyebrows, gradient text, grelhas ícone+texto). Na marketing, o único glass intencional é o **nav pill líquido** (blur + saturação estilo iOS); não espalhar glass pelo resto da página.

**Key Characteristics:**

- Operate no app; Persuade na landing — tokens partilhados, composição distinta
- Light creme/teal; dark zinc; primary teal clínico (não purple)
- Landing: nav pill flutuante + ritmo Origin + placeholders de imagem
- `AppPage` + Shadcn + Tabler/Lucide conforme o sítio
- PDF clínico / CREFITO e preços em `BILLING_PLAN_PRICES_BRL` fazem parte da verdade do produto

## Colors

Paleta semântica via CSS variables em `src/app/globals.css` (fonte normativa). Preferir classes Tailwind semânticas (`bg-background`, `text-primary`) a hex soltos.

### Primary

- **Teal clínico** (`oklch(58.813% 0.11371 171.371 / 0.781)`): CTAs, links activos, indicador activo do nav da landing, tabs seleccionadas. Usar com parcimónia.

### Neutral

- **Papel creme** (`oklch(0.965 0.02 82)`): fundo light (app e landing).
- **Tinta** (`oklch(0.145 0.01 55)`): texto principal no light.
- **Cartão** / **Muted** / **Linha**: tokens Shadcn habituais.
- **Dark**: fundo quase preto zinc (`globals.css` `.dark`); CTAs claros via `--primary` no dark.

### Destructive

- **Alerta clínico** (`oklch(0.577 0.245 27.325)`): remover / revogar com confirmação — nunca decorativo.

### Named Rules

**The Semantic Token Rule.** Novas UIs usam tokens Shadcn. Não inventar paletas paralelas nem `bg-white` / `text-gray-*` soltos (excepto alpha em glass da landing nav).

**The One Accent Rule.** O primary ocupa pouco do ecrã; o resto é papel, tinta e linha. Atmosfera da landing: radiais teal/neutros suaves, nunca purple.

## Typography

**Display / Title Font:** Georgia (via `.font-serif`) — títulos de card, dialog, secção e headlines da landing.  
**Body Font:** Inter (`--font-sans`).  
**Mono Font:** Geist Mono — dados tabulares, horas.

### Hierarchy

- **Display** (serif, ~2.25–3.75rem): hero da landing.
- **Headline** (serif, ~1.5–3rem): títulos de secção (marketing e app).
- **Title** (serif, ~1.125rem): `CardTitle`, `DialogTitle`.
- **Body** (sans, 0.875–1rem): conteúdo e formulários.
- **Label** (sans, 0.75rem): meta, badges — sentence case.

### Named Rules

**The Serif Title Rule.** Serif em títulos de superfície; nunca em botões, inputs ou links densos do nav.

## Layout

- Shell autenticado: `AppPage` (`px-4 lg:px-6`, `gap-4` / `md:gap-6`).
- Listas e hubs: grelha responsiva sem forçar cards decorativos.
- Workspaces clínicos: `ClinicalWorkspaceShell` — uma secção activa + footer fixo.
- Landing: content `max-w-6xl`; secções com ritmo generoso (`py-20` / `lg:py-28`); grelhas 1 → 2 → 3 colunas.
- Altura: `dvh` / `svh`; nunca `vh` em overlays.

### Landing composition (ordem fixa)

1. Nav pill flutuante + spacer
2. Hero (headline + CTAs trial)
3. Showcase (`#produto`) — placeholder grande
4. Track (`#como-funciona`) — 3 cards tonais
5. Dual — turno clínico vs liderança
6. Capacidades — 2×2 pronto + lista “em evolução”
7. Planos (`#planos`) — `BILLING_PLAN_DEFS`
8. CTA circular + footer

## Elevation & Depth

**App (Operate):** flat-by-default — borda + fundo tonal; sombra só em hover de card ou overlays.

**Landing (Persuade):** secções e cards sobretudo flat (`border` + `bg-card` / tons); CTA final pode usar halo radial teal suave (não purple glow).

**Glass na nav marketing:** o pill flutuante (`LandingNav`) aplica blur + saturate via classes Tailwind ao scroll (`data-scrolling=true`) — sem utilitário CSS dedicado.

### Named Rules

**The Flat-By-Default Rule.** No app: superfície em repouso = border + card/background.  
**The Landing Glass Exception.** Glass líquido só no nav pill da `/`; não como padrão de cards ou hero.

## Shapes

- Raio base `--radius: 0.625rem` (app).
- Cards app: `rounded-xl`.
- Cards / placeholders da landing: `rounded-2xl` / `rounded-3xl`.
- Nav marketing: `rounded-full` (pill); mobile full-bleed no topo.
- Chips de filtro no app: `rounded-full` só quando o padrão local já o usa.

## Components

### Buttons

- Variantes Shadcn `Button`; ícones `data-icon="inline-start|inline-end"`.
- Destrutivo com confirmação.

### Cards / Containers

- App: cards só com interacção ou agrupamento real.
- Landing: cards de feature/prova com `rounded-3xl` e placeholders — não grelhas ícone+texto.

### Inputs / Fields

- Shadcn + RHF + Zod; `DatePicker` — nunca `type="date"`.

### Navigation

- **App:** Sidebar Shadcn; tabs de paciente = underline `border-primary`.
- **Landing:** `LandingNav` — pill `fixed` centrada (`md:top-6`), largura anima no scroll (80% → ~640px), `ThemeSwitcher`, Entrar + teste, âncoras com ponto `primary` no activo. Sem Lenis; scroll nativo. Spacer abaixo do nav para o conteúdo.

### Media

- `MediaPlaceholder` em `src/app/(marketing)/_components/` — slot até haver mockups reais; `aria-label` descritivo.

### Signature: Clinical workspace

Índice de secções + painel único + footer fixo. Não empilhar todas as secções num scroll longo.

## Do's and Don'ts

### Do:

- **Do** seguir `AppPage`, tokens semânticos e rotas semelhantes no Operate.
- **Do** dual-theme na landing; testar light e dark.
- **Do** manter honestidade de produto (trial, preços públicos, “em evolução”).
- **Do** empty states com próxima acção quando o utilizador pode criar.
- **Do** confirmar acções que apagam dados ou invalidam links.
- **Do** copy PT-BR de domínio (paciente, responsável, instrumento, evolução).

### Don't:

- **Don't** criar design system paralelo ao Shadcn / `globals.css`.
- **Don't** usar eyebrow/kicker, gradient text, purple-glow ou cards ícone+texto como estrutura.
- **Don't** espalhar glass fora do nav pill da landing.
- **Don't** inventar testemunhos, logos de clientes ou features como prontas (portal/WhatsApp).
- **Don't** ejectar o utilizador do contexto do paciente sem necessidade.
- **Don't** hardcodar `vh` em modais/drawers.
