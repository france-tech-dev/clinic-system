# Bounded contexts (DDD estratégico)

Mapa leve — **sem** Aggregates, domain events nem pastas `domain/`.  
Complementa [`architecture.md`](./architecture.md).

---

## Ideia

Cada contexto tem **linguagem própria** e **dono do código**.  
Cruzar contextos = `application/` ou import via `domains/X/index.ts` (ver [`target-structure.md`](./target-structure.md)).  
Evitar imports profundos (`repository` / arquivos internos) entre contextos.

```
                    ┌─────────────────────────┐
                    │  Platform / Auth / Org  │  src/platform (@/server)
                    │  (Better Auth, membership, platform admin)
                    └───────────┬─────────────┘
                                │ sessão + org ativa
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
   ┌─────────────┐      ┌─────────────┐       ┌─────────────┐
   │   Patient   │      │  Schedule   │       │   Finance   │
   │  Guardian   │◄────►│             │──────►│             │
   │  Anamnese   │      │             │       │             │
   │  Assessment │      └─────────────┘       └─────────────┘
   │  Evolution  │              │
   │  Protocol   │              │
   └─────────────┘              │
          │                     │
          └──────────┬──────────┘
                     ▼
              ┌─────────────┐     ┌─────────────┐
              │  Dashboard  │     │   Billing   │  mensalidade Stripe
              │  Settings   │     │  (plano)    │  domains/billing + platform/billing
              │  Team       │     └─────────────┘
              └─────────────┘
```

---

## Contextos

| Contexto                  | Pasta                                                          | Linguagem (exemplos)                                    | Não é dono de                                           |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| **Identity & access**     | `src/platform` (`auth`, `organizations`, …) — alias `@/server` | sessão, member, role, convite, platform admin           | pacientes, agenda, caixa                                |
| **Billing (SaaS)**        | `src/domains/billing` + `src/platform/billing`                 | trial, plano, seats/extras, Stripe                      | conteúdo clínico                                        |
| **Patient care**          | `src/domains` → `patient`, `guardian`, `anamnese`              | paciente, responsável, anamnese, PDF prontuário         | preços de plano SaaS                                    |
| **Assessment**            | `src/domains/assessment`                                       | Assessment (prontuário narrativo + domínios)            | instrumentos pontuados; evolução por sessão             |
| **Evolution**             | `src/domains/evolution`                                        | Evolution (nota por atendimento), vínculo a Appointment | avaliação clínica; agenda                               |
| **Protocol & assessment** | `src/domains/protocol` (+ módulos GMFM, etc.)                  | ProtocolAssessment, item bruto, interpretationAI, seção | T-scores inventados; billing                            |
| **Schedule**              | `src/domains/schedule`                                         | Appointment, memberId (profissional da sessão), status  | lançamentos de caixa (só dispara fluxo em `app/`)       |
| **Finance**               | `src/domains/finance`                                          | CashTransaction, preço paciente, resumo                 | regras de agenda                                        |
| **Clinic ops**            | `settings`, `team`, `dashboard` (em `src/domains`)             | branding, profissionais, painel                         | domínio clínico fino                                    |
| **AI runtime**            | `src/shared/lib/ai`                                            | provider, stream, audit, rate limit                     | prompts clínicos (ficam no contexto dono, ex. protocol) |

### Billing: duas pastas de propósito

| Pasta (conceito)                        | Papel                                              |
| --------------------------------------- | -------------------------------------------------- |
| `platform/billing` (`@/server/billing`) | Gates cedo (trial/acesso) ligados a org/auth       |
| `domains/billing`                       | Domínio de produto: planos, checkout, UI `/planos` |

Não fundir tudo em platform — billing de produto é domínio; auth gates são plataforma.

---

## Onde vive UI

| Situação                        | Destino                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| Só **uma** rota                 | `src/app/.../_components/`                                   |
| ≥2 rotas do **mesmo** contexto  | `src/features/[domínio]/` (UI/hooks) — **não** em `domains/` |
| Genérico (sem regra de negócio) | `src/ui/`                                                    |
| Negócio (repo/service/jobs)     | `src/domains/` — **sem** React                               |

Ver [`target-structure.md`](./target-structure.md) e [`architecture.md`](./architecture.md). Fase 1 aplicada (`src/` + `worker/`).

**Não** meter UI clínica em `platform/`. Platform = Better Auth, org — sem UI de domínio.

---

## Integrações típicas (anti-corruption em `app/`)

| Fluxo                             | Quem orquestra               | Como                                                                   |
| --------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| Agenda → sugerir entrada no caixa | `app/` (página/dialog)       | chama actions de `schedule` e `finance`                                |
| Paciente + anamnese no PDF        | `app/`                       | junta DTOs planos; tipos partilhados em `shared/types` se preciso      |
| Protocolo + interpretação IA      | `protocol` + `shared/lib/ai` | prompt/scores no protocol; motor em shared                             |
| Billing (write / seats)           | action/API                   | `requireOrgWrite` / `requireSeatAvailable` — sem query pesada no proxy |

---

## Glossário curto (evitar ambiguidade)

| Termo                  | Significa                                                               |
| ---------------------- | ----------------------------------------------------------------------- |
| `interpretationAI`     | Texto de apoio à leitura do protocolo; **não** score normativo          |
| Somas brutas por seção | Determinístico a partir das respostas; **não** T-score                  |
| `Appointment.memberId` | Profissional **da sessão** (Member)                                     |
| `Organization.name`    | Nome da clínica (PDF / branding)                                        |
| Limite de plano        | Seats (`maxProfessionals` / extras) — módulos não são gated por feature |

---

## O que _não_ fazer em nome de DDD

- Pastas `domain/` / `application/` / `infrastructure/` por feature
- Entities ricas + Aggregates em cima do Prisma
- Domain events / outbox sem necessidade de produto
- Meter UI de domínio dentro de `src/domains`
- Mover `patient` / `protocol` / … para `src/platform`
