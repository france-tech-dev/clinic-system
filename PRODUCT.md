# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Utilizadores primários em duas superfícies distintas:

- **Profissional clínico** (MEMBER e acima) — no dia a dia: agenda, pacientes, evoluções, anamnese e avaliações.
- **Liderança da clínica** (OWNER, ADMIN, MANAGER) — gestão: dashboard com KPIs/gráficos, caixa, equipa, organização e planos.

**Responsáveis / pais** (`Role.CLIENT`) acedem ao portal do responsável — em evolução; será canal de acompanhamento e lembretes (incl. WhatsApp).

## Product Purpose

A **Movi Clinicas** é um sistema de gestão clínica multi-tenant para clínicas de saúde (Terapia Ocupacional e equipas multi-profissionais). Reúne num só produto o que as clínicas tipicamente procuram em softwares separados: prontuário, agenda, anamnese, avaliações estruturadas, caixa, dashboard e (em evolução) portal dos pais com lembretes de consulta por WhatsApp.

Sucesso: a clínica opera o fluxo clínico e administrativo no mesmo sistema, com custo-benefício claro e isolamento correcto dos dados por organização.

## Positioning

Tudo-em-um para clínicas multi-profissionais (com ênfase em TO), com funcionalidades ainda raras no mercado brasileiro no mesmo produto — nomeadamente **portal dos pais** e **envio de WhatsApp pelo sistema** (lembrete de consulta) — sem forçar a clínica a juntar várias ferramentas.

## Operating Context

- Uso em desktop e mobile no browser, durante o atendimento e na gestão da clínica.
- Fluxos centrais: marcar/realizar sessões na agenda; registar evoluções e PDFs (prontuário, anamnese); cobrança no caixa; visão de liderança no dashboard; assinatura Stripe (trial → plano).
- Terminologia de produto: clínica = organização; painel interno da plataforma Movi ≠ dashboard da clínica; “Fichário” aparece em copy de onboarding.

## Capabilities and Constraints

**Confirmado**

- Multi-tenant: dados **sempre isolados** por `organizationId`.
- PDF clínico com assinatura / CREFITO do profissional.
- Trial Stripe de **7 dias**; depois sem cartão a app passa a read-only conforme billing.
- UI e copy em **português (BR)**.
- Acessibilidade mínima: uso viável em **desktop e mobile**.
- Superfícies: Dashboard (liderança: KPIs/gráficos), Agenda (turno clínico do dia), Pacientes, Anamnese, Avaliações, Caixa, Profissionais, Configurações, Organização, Planos; Portal do responsável em evolução.
- Planos: Starter / Pro / Enterprise com features gated (anamnese, caixa, avaliações, portal).

**Em evolução / não inventar como pronto**

- Portal dos pais e WhatsApp de lembrete — compromisso de produto; implementação parcial ou ainda por vir.

## Brand Commitments

- Nome de produto: **Movi Clinicas** (short: **Movi**).
- Produção: https://movi-clinicas.francetech.com.br
- Não inventar testemunhos, clientes nomeados ou benchmarks sem evidência no repositório.

## Evidence on Hand

- README e `docs/billing.md` descrevem stack, rotas e decisões de billing.
- App em produção com utilizadores reais (profissionais).
- Ausências a não fabricar: DESIGN.md / sistema visual documentado; testemunhos; cases de clientes.

## Product Principles

1. **Um sistema, dois modos** — clínico (turno, paciente, registo) e liderança (números, caixa, equipa) sem misturar o job de cada ecrã.
2. **Clínica isolada** — nenhum desenho ou fluxo pode atravessar dados entre organizações.
3. **Tudo-em-um com honestidade** — destacar o que já existe; marcar portal/WhatsApp como evolução até estarem entregues.
4. **Documentos clínicos confiáveis** — PDF e identidade profissional (assinatura/CREFITO) fazem parte do produto, não são extras cosméticos.
5. **Custo-benefício claro** — planos e trial transparentes; a UI de billing não deve confundir valor com jargão técnico.

## Accessibility & Inclusion

Requisito mínimo confirmado: interfaces utilizáveis em **desktop e mobile**. Sem standard WCAG formal declarado além disso.
