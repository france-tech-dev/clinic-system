import { signIn } from "./helpers/auth.js";
import { getConfig } from "./helpers/config.js";
import {
  runAuthenticatedMix,
  runLeadershipMix,
} from "./helpers/pages.js";

/**
 * Stress — sobe até degradação (~150 VUs). Thresholds frouxos:
 * o objetivo é observar saturação (CPU/RAM / Postgres), não "passar CI".
 *
 *   pnpm test:load:stress
 *
 * Monitorar app + Postgres + Redis na VM.
 */
export const options = {
  scenarios: {
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 25 },
        { duration: "2m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "2m", target: 150 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    // Stress: falha só em colapso massivo
    http_req_failed: ["rate<0.4"],
    http_req_duration: ["p(95)<15000"],
    checks: ["rate>0.5"],
  },
};

export function setup() {
  const config = getConfig();
  const cookie = signIn(config);
  return { config, cookie };
}

export default function stressScenario(data) {
  if (Math.random() < 0.15) {
    runLeadershipMix(data.config, data.cookie);
  } else {
    runAuthenticatedMix(data.config, data.cookie);
  }
}
