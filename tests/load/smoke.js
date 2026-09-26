import { signIn } from "./helpers/auth.js";
import { getConfig } from "./helpers/config.js";
import { runAuthenticatedMix } from "./helpers/pages.js";

/**
 * Smoke — gate rápido (1–2 VUs, ~30s).
 *
 *   BASE_URL=https://staging… pnpm test:load:smoke
 */
export const options = {
  scenarios: {
    smoke: {
      executor: "constant-vus",
      vus: 2,
      duration: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
    checks: ["rate>0.95"],
  },
};

export function setup() {
  const config = getConfig();
  const cookie = signIn(config);
  return { config, cookie };
}

export default function smokeScenario(data) {
  runAuthenticatedMix(data.config, data.cookie);
}
