# Microsoft Entra ID – Erro `invalid_client`

Quando o login com Microsoft Entra ID falha com **OAuthCallbackError: invalid_client**, o Azure está rejeitando a aplicação no passo de troca do código por tokens.

## Checklist de correção

### 1. Variáveis de ambiente (`.env` ou `.env.local`)

Confirme que existem e estão preenchidas (sem aspas extras ou espaços):

```env
AUTH_MICROSOFT_ENTRA_ID_ID="<Application (client) ID do Azure>"
AUTH_MICROSOFT_ENTRA_ID_SECRET="<Valor do client secret>"
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<tenant ou common>/v2.0"
```

- **ID**: no Azure → App registrations → sua app → Overview → **Application (client) ID**.
- **Secret**: Certificates & secrets → New client secret → copie o **Value** (não o Secret ID). O valor some depois; se expirou, crie outro e atualize o `.env`.
- **Issuer** conforme o tipo de conta na inscrição da app:
  - **Single tenant**: `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0`
  - **Multi-tenant**: `https://login.microsoftonline.com/organizations/v2.0`
  - **Multi-tenant + contas pessoais**: `https://login.microsoftonline.com/common/v2.0`
  - **Só contas pessoais**: `https://login.microsoftonline.com/consumers/v2.0`

### 2. Redirect URI no Azure

No [Microsoft Entra admin center](https://entra.microsoft.com/) → Identity → Applications → App registrations → sua app → **Authentication**:

- Em **Platform configurations** → **Web** (ou adicione uma plataforma Web).
- Em **Redirect URIs** adicione exatamente:
  - Desenvolvimento: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
  - Produção: `https://seu-dominio.com/api/auth/callback/microsoft-entra-id`

O URI deve bater **exatamente** (protocolo, host, porta e path). Erros comuns: `https` em dev, porta errada, path com barra extra.

### 3. App como “confidential” (com client secret)

Para fluxo com **client_secret** (como no Auth.js), a app no Azure deve ser **confidential**:

- App registrations → sua app → **Authentication**.
- Em **Advanced settings** → **Allow public client flows** deve estar **No** para uso típico de “Web” com client secret.

Se a app estiver como “public client” e você enviar client secret, o Azure pode responder `invalid_client`.

### 4. Client secret expirado

Em **Certificates & secrets**, client secrets têm validade. Se expirou:

1. Crie um novo client secret.
2. Copie o valor e atualize `AUTH_MICROSOFT_ENTRA_ID_SECRET` no `.env`.
3. Reinicie o servidor (ex.: `pnpm dev`).

### 5. Reiniciar o servidor

Depois de alterar `.env`, reinicie o processo do Next.js (por exemplo, pare e rode de novo `pnpm dev`).

---

**Referências**

- [Auth.js – Microsoft Entra ID](https://authjs.dev/getting-started/providers/microsoft-entra-id)
- [Erros Auth.js – OAuthCallbackError](https://errors.authjs.dev#oauthcallbackerror)
