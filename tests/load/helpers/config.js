/**
 * Configuração partilhada dos cenários k6.
 * Variáveis: BASE_URL, K6_EMAIL, K6_PASSWORD, K6_PATIENT_ID (opcional),
 * K6_ALLOW_PROD=1 (opt-in explícito para produção).
 *
 * Nota: o runtime k6 (goja) tem suporte limitado a `new URL()` — validamos à mão.
 */

const PROD_HOST = "movi-clinicas.francetech.com.br";

const DEMO_EMAIL = "fisio.demo@example.com";
const DEMO_PASSWORD = "DemoMovi2026!";

function normalizeBaseUrl(raw) {
  const trimmed = (raw || "").trim().replace(/\/$/, "");
  if (!trimmed) {
    throw new Error(
      "BASE_URL é obrigatória (ex.: https://seu-staging.exemplo.com).",
    );
  }
  if (!/^https?:\/\/[^\s/]+/i.test(trimmed)) {
    throw new Error(
      `BASE_URL inválida (precisa de http(s)://host): ${trimmed}`,
    );
  }
  const withoutScheme = trimmed.replace(/^https?:\/\//i, "");
  const host = withoutScheme.split("/")[0].split(":")[0].toLowerCase();
  const allowProdRaw = (__ENV.K6_ALLOW_PROD || "").trim().toLowerCase();
  const allowProd = allowProdRaw === "1" || allowProdRaw === "true";
  if (host === PROD_HOST && !allowProd) {
    throw new Error(
      `Recusado: BASE_URL aponta para produção (${PROD_HOST}). ` +
        `Use staging, ou defina K6_ALLOW_PROD=1 no .env se for intencional.`,
    );
  }
  return trimmed;
}

export function getConfig() {
  const baseUrl = normalizeBaseUrl(__ENV.BASE_URL);
  return {
    baseUrl,
    email: (__ENV.K6_EMAIL || DEMO_EMAIL).trim(),
    password: (__ENV.K6_PASSWORD || DEMO_PASSWORD).trim(),
    patientId: (__ENV.K6_PATIENT_ID || "").trim() || null,
  };
}
