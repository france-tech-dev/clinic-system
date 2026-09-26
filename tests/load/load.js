import { signIn } from "./helpers/auth.js";
import { getConfig } from "./helpers/config.js";
import {
  runAuthenticatedMix,
  runLeadershipMix,
} from "./helpers/pages.js";

/**
 * Carga média — sobe 5→15 VUs, ~4 min.
 *
 *   BASE_URL=https://staging… pnpm test:load
 */
export const options = {
  scenarios: {
    average_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 5 },
        { duration: "2m", target: 15 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.1"],
    http_req_duration: ["p(95)<5000"],
    checks: ["rate>0.9"],
  },
};

export function setup() {
  const config = getConfig();
  const cookie = signIn(config);
  return { config, cookie };
}

export default function loadScenario(data) {
  // ~15% tenta rotas de liderança (tolerante a 403)
  if (Math.random() < 0.15) {
    runLeadershipMix(data.config, data.cookie);
  } else {
    runAuthenticatedMix(data.config, data.cookie);
  }
}
