/**
 * dependency-cruiser — fronteiras de arquitectura.
 * Ver docs/architecture.md (secção 4). Correr com `pnpm arch`.
 *
 * Camadas: app/ → features/ → shared/ ; components/ → shared/ ; server/ → shared/
 */
module.exports = {
  forbidden: [
    {
      name: "no-cross-feature",
      comment:
        "features/ não importam entre si — orquestrar em app/; utils comuns em shared/.",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: {
        path: "^src/features/([^/]+)/",
        pathNot: "^src/features/$1/",
      },
    },
    {
      name: "no-app-imports",
      comment:
        "features/, shared/, server/ e components/ não podem importar de app/.",
      severity: "error",
      from: { path: "^src/(features|shared|server|components)/" },
      to: { path: "^src/app/" },
    },
    {
      name: "shared-no-features",
      comment: "shared/ é kernel transversal — não importa features/.",
      severity: "error",
      from: { path: "^src/shared/" },
      to: { path: "^src/features/" },
    },
    {
      name: "server-no-features",
      comment: "server/ (Better Auth) não importa domínios clínicos (features/).",
      severity: "error",
      from: { path: "^src/server/" },
      to: { path: "^src/features/" },
    },
    {
      name: "components-no-features",
      comment: "components/ deve importar apenas shared/, nunca features/.",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/features/" },
    },
    {
      name: "no-circular",
      comment: "Dependência circular — quebrar o ciclo (extrair tipos/leitura).",
      severity: "error",
      from: { path: "^src/" },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "(node_modules|prisma/generated)" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },
  },
};
