import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const prismaGenerated = path.resolve(root, "./prisma/generated/prisma");

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: [
      {
        find: "@/shared",
        replacement: path.resolve(root, "./src/shared"),
      },
      {
        find: "@/features",
        replacement: path.resolve(root, "./src/features"),
      },
      {
        find: "@/domains",
        replacement: path.resolve(root, "./src/domains"),
      },
      {
        find: "@/server",
        replacement: path.resolve(root, "./src/platform"),
      },
      {
        find: "@/components",
        replacement: path.resolve(root, "./src/ui"),
      },
      {
        find: "@/hooks",
        replacement: path.resolve(root, "./src/hooks"),
      },
      {
        find: new RegExp("^@prisma/(?!adapter-|client/runtime)(.+)$"),
        replacement: prismaGenerated + "/$1",
      },
      { find: "@", replacement: path.resolve(root, "./src") },
    ],
  },
});
