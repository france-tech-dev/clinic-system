import "dotenv/config";
import { spawnSync } from "node:child_process";

const script = process.argv[2];
if (!script) {
  console.error("Uso: node scripts/run-k6.mjs <caminho-do-script-k6>");
  process.exit(1);
}

const result = spawnSync("k6", ["run", script, ...process.argv.slice(3)], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
