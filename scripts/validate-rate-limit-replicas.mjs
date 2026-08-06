/**
 * Valida rate limit de login: spam de sign-in → 429 + X-Retry-After.
 *
 * Uso (staging ou local em NODE_ENV=production):
 *   pnpm validate:rate-limit -- --url https://teu-staging.exemplo
 *   pnpm validate:rate-limit -- --url http://127.0.0.1:3000
 *
 * Default Better Auth em /sign-in*: max 3 / 10s → o 4.º pedido deve ser 429.
 *
 * Opcional (duas réplicas, contador partilhado na DB):
 *   pnpm validate:rate-limit -- --a http://127.0.0.1:3001 --b http://127.0.0.1:3002
 */
import "dotenv/config";
import { Client } from "pg";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--") && arr[i + 1] && !arr[i + 1].startsWith("--")) {
      acc.push([cur.slice(2), arr[i + 1]]);
    }
    return acc;
  }, []),
);

const path = "/api/auth/sign-in/email";
const clientIp = args.ip ?? "203.0.113.50";

const body = JSON.stringify({
  email: "rate-limit-probe@example.com",
  password: "invalid-password-for-rate-limit-probe",
});

function bases() {
  if (args.url) {
    const u = args.url.replace(/\/$/, "");
    return [u, u, u, u];
  }
  const a = (args.a ?? "http://127.0.0.1:3001").replace(/\/$/, "");
  const b = (args.b ?? "http://127.0.0.1:3002").replace(/\/$/, "");
  return [a, b, a, b];
}

async function post(base) {
  const origin = (process.env.BETTER_AUTH_URL ?? base).trim();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "x-forwarded-for": clientIp,
      "x-real-ip": clientIp,
    },
    body,
  });
  return {
    status: res.status,
    retryAfter: res.headers.get("x-retry-after"),
    text: await res.text(),
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const sequenceBases = bases();
  const mode = args.url ? `single (${args.url})` : "replicas A/B";

  const db = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL })
    : null;
  if (db) {
    await db.connect();
    await db.query(`DELETE FROM rate_limit WHERE key LIKE $1`, [
      `%${clientIp}%`,
    ]);
  }

  console.log(`Modo=${mode}`);
  console.log(`Probe IP=${clientIp}`);
  console.log("Expectativa: pedidos 1–3 OK (≠429); pedido 4 = 429 + X-Retry-After\n");

  const results = [];
  for (let i = 0; i < 4; i++) {
    const base = sequenceBases[i];
    const r = await post(base);
    results.push(r);
    console.log(
      `${i + 1} → ${base}: status=${r.status} X-Retry-After=${r.retryAfter ?? "-"}`,
    );
  }

  const [r1, r2, r3, r4] = results;

  assert(r1.status !== 429, `Pedido 1 não deveria ser 429 (foi ${r1.status})`);
  assert(r2.status !== 429, `Pedido 2 não deveria ser 429 (foi ${r2.status})`);
  assert(r3.status !== 429, `Pedido 3 não deveria ser 429 (foi ${r3.status})`);
  assert(
    r4.status === 429,
    `Pedido 4 deveria ser 429 (foi ${r4.status}). ` +
      `Confirma NODE_ENV=production (ou rateLimit.enabled) e storage database.`,
  );
  assert(
    r4.retryAfter != null && Number(r4.retryAfter) > 0,
    `X-Retry-After em falta ou inválido: ${r4.retryAfter}`,
  );

  if (db) {
    const { rows } = await db.query(
      `SELECT key, count, "lastRequest" FROM rate_limit WHERE key LIKE $1 ORDER BY key`,
      [`%${clientIp}%`],
    );
    assert(
      rows.length > 0,
      "Nenhuma linha em rate_limit — storage database não está a gravar",
    );
    console.log("\nLinhas rate_limit para o IP de probe:");
    for (const row of rows) {
      console.log(`  key=${row.key} count=${row.count}`);
    }
    await db.end();
  }

  console.log("\nOK — 429 no login + X-Retry-After.");
  console.log(
    "Toast: no browser, falha de login 4× seguidas → mensagem com segundos.",
  );
}

main().catch(async (err) => {
  console.error("\nFALHOU:", err.message);
  process.exit(1);
});
