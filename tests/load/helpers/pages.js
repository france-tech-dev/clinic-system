import http from "k6/http";
import { check, sleep } from "k6";
import { authHeaders } from "./auth.js";

/**
 * Mix autenticado de páginas RSC + get-session.
 * Weights via probabilidade simples (sem extensão k6).
 */
export function runAuthenticatedMix(config, cookie) {
  const headers = authHeaders(cookie);
  const roll = Math.random();

  if (roll < 0.35) {
    getPage(config.baseUrl, "/agenda", headers, "page_agenda");
  } else if (roll < 0.7) {
    getPage(config.baseUrl, "/pacientes", headers, "page_pacientes");
  } else if (roll < 0.9 && config.patientId) {
    getPage(
      config.baseUrl,
      `/pacientes/${config.patientId}`,
      headers,
      "page_paciente_detail",
    );
  } else if (roll < 0.9) {
    // Sem K6_PATIENT_ID — redistribui para lista
    getPage(config.baseUrl, "/pacientes", headers, "page_pacientes");
  } else {
    getSession(config.baseUrl, headers);
  }

  // Think time curto (utilizador real)
  sleep(0.5 + Math.random() * 1.5);
}

export function runLeadershipMix(config, cookie) {
  const headers = authHeaders(cookie);
  const roll = Math.random();

  if (roll < 0.5) {
    getPageOptional(config.baseUrl, "/dashboard", headers, "page_dashboard");
  } else {
    getPageOptional(config.baseUrl, "/caixa", headers, "page_caixa");
  }

  sleep(0.5 + Math.random() * 1.5);
}

function getPage(baseUrl, path, headers, tag) {
  const res = http.get(`${baseUrl}${path}`, {
    headers,
    tags: { name: tag },
    redirects: 5,
  });
  check(res, {
    [`${tag} status 200`]: (r) => r.status === 200,
  });
  return res;
}

/** OWNER/liderança — 403/302 não contam como falha de infra. */
function getPageOptional(baseUrl, path, headers, tag) {
  const res = http.get(`${baseUrl}${path}`, {
    headers,
    tags: { name: tag },
    redirects: 5,
  });
  check(res, {
    [`${tag} reachable`]: (r) =>
      r.status === 200 || r.status === 302 || r.status === 303 || r.status === 403,
  });
  return res;
}

function getSession(baseUrl, headers) {
  const res = http.get(`${baseUrl}/api/auth/get-session`, {
    headers: {
      ...headers,
      Accept: "application/json",
    },
    tags: { name: "auth_get_session" },
  });
  check(res, {
    "get-session status 200": (r) => r.status === 200,
  });
  return res;
}
