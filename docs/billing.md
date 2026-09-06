# Billing — mensalidade Stripe

Cobrança da **Movi** às clínicas pelo uso do sistema. Não é Stripe Connect: o dinheiro vai só para a plataforma.

**App:** [https://movi-clinicas.francetech.com.br](https://movi-clinicas.francetech.com.br)

## Decisões

| Tema                          | Escolha                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Produto                       | Stripe Billing (assinatura), não Connect                                           |
| Trial                         | 7 dias, sem cartão, tudo libertado                                                 |
| Sem cartão no dia 7           | Stripe cancela (`missing_payment_method: cancel`)                                  |
| App após cancel               | **Read-only** (consulta; criar/editar bloqueado)                                   |
| Assinar no trial              | Update da **mesma** assinatura; cobra no fim dos 7 dias                            |
| Depois do cancel              | Checkout novo (`mode: subscription`)                                               |
| Clínicas sem linha de billing | Acesso completo (legado — já em produção)                                          |
| Preços                        | Catálogo público em `BILLING_PLAN_PRICES_BRL`; Stripe via `STRIPE_PRICE_*` no host |

## Planos

| Plano          | Profissionais | Mensalidade (catálogo)        | Inclui                                                                      |
| -------------- | ------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **Starter**    | até 3         | ver `BILLING_PLAN_PRICES_BRL` | Agenda, pacientes, profissionais, painel, busca, configurações, organização |
| **Pro**        | até 9         | ver `BILLING_PLAN_PRICES_BRL` | Starter + anamnese + caixa                                                  |
| **Enterprise** | ilimitado     | ver `BILLING_PLAN_PRICES_BRL` | Pro + avaliações + portal dos pais + IA                                     |

Trial ignora plano e limite de profissionais.

## Fluxo

1. Criar clínica → Customer + Subscription com trial 7 dias (preço Starter só como item Stripe; entitlements = tudo).
2. No trial, **Assinar agora** → Checkout `mode: setup` + update do preço na assinatura existente. Cartão fica na sub; primeira cobrança no fim do trial.
3. Dia 7 sem cartão → `customer.subscription.deleted` → `canceled` → app read-only.
4. Depois do cancel → Checkout `mode: subscription` no mesmo Customer; webhook faz **update** da linha, não cria segunda.

## Webhooks

Endpoint: `POST /api/stripe/webhook`

- `customer.subscription.created` / `updated` / `deleted`
- `checkout.session.completed` (setup → PM + preço; subscription → sync do novo `subscription` id)
- `invoice.paid` / `invoice.payment_failed`

## Código

- Catálogo (features gated + preços públicos): `src/shared/constants/billing-plans.ts`
- Persistência / Stripe: `src/features/billing/`
- Trial na criação da org: `src/server/billing/start-trial.ts` (hook Better Auth)
- Gates nas **actions** (`requireOrgWrite` / `requireOrgFeatureWrite`) — o proxy não consulta billing
- Isenção a dedo: `Organization.billingExempt` + `/plataforma` (allowlist `PLATFORM_ADMIN_USER_IDS`)
- Customer Portal em `/planos` (`billingPortal.sessions`) — cartão + cancelar (activar no Dashboard Stripe)

## Env (produção)

```env
STRIPE_SECRET_KEY="rk_..."          # preferir restricted key
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
```

Dashboard Stripe: 3 Products (Starter, Pro, Enterprise), um Price mensal cada. Webhook apontar para `https://movi-clinicas.francetech.com.br/api/stripe/webhook`.

Customer Portal: Settings → Billing → Customer portal — activar actualização de método de pagamento e cancelamento de assinatura (o botão em `/planos` abre esta sessão).
