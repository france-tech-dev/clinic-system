import http from "k6/http";
import { check } from "k6";

/**
 * Login Better Auth uma vez (setup). Devolve Cookie header para os VUs.
 * Não martela o sign-in nos VUs — rate limit Redis.
 */
export function signIn(config) {
  const url = `${config.baseUrl}/api/auth/sign-in/email`;
  const res = http.post(
    url,
    JSON.stringify({
      email: config.email,
      password: config.password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Origin: config.baseUrl,
        Referer: `${config.baseUrl}/auth/login`,
      },
      tags: { name: "auth_sign_in" },
    },
  );

  const ok = check(res, {
    "sign-in status 200": (r) => r.status === 200,
  });

  if (!ok) {
    throw new Error(
      `Login falhou (status=${res.status}): ${String(res.body).slice(0, 300)}`,
    );
  }

  const cookie = cookieHeaderFromResponse(res);
  if (!cookie) {
    throw new Error(
      "Login OK mas sem Set-Cookie de sessão. Confirme BETTER_AUTH_URL no staging.",
    );
  }

  return cookie;
}

function cookieHeaderFromResponse(res) {
  const parts = [];
  const jar = res.cookies || {};
  for (const name of Object.keys(jar)) {
    const entries = jar[name];
    if (!entries || entries.length === 0) continue;
    const last = entries[entries.length - 1];
    if (last.value) {
      parts.push(`${last.name || name}=${last.value}`);
    }
  }
  return parts.length > 0 ? parts.join("; ") : null;
}

export function authHeaders(cookie) {
  return {
    Cookie: cookie,
    Accept: "text/html,application/json",
  };
}
