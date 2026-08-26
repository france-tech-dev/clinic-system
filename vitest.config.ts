import path from "node:path";
import { defineConfig } from "vitest/config";

const prismaGenerated = path.resolve(__dirname, "./prisma/generated/prisma");

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
        replacement: path.resolve(__dirname, "./src/shared"),
      },
      {
        find: "@/features",
        replacement: path.resolve(__dirname, "./src/features"),
      },
      {
        find: "@/domains",
        replacement: path.resolve(__dirname, "./src/domains"),
      },
      {
        find: "@/server",
        replacement: path.resolve(__dirname, "./src/platform"),
      },
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "./src/ui"),
      },
      {
        find: "@/hooks",
        replacement: path.resolve(__dirname, "./src/hooks"),
      },
      {
        find: new RegExp("^@prisma/(?!adapter-|client/runtime)(.+)$"),
        replacement: prismaGenerated + "/$1",
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
