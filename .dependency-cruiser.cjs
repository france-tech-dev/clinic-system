/**
 * dependency-cruiser — fronteiras de arquitectura.
 * Ver docs/architecture.md (secção 4). Correr com `pnpm arch`.
 *
 * Camadas: src/app → src/features (UI) → src/domains → src/shared ;
 * src/ui → src/shared ; src/platform → src/shared
 */
module.exports = {
  forbidden: [
    {
      name: "no-cross-feature",
      comment:
        "domains/ não importam entre si — orquestrar em app/; utils comuns em shared/.",
      severity: "error",
      from: { path: "^src/domains/([^/]+)/" },
      to: {
        path: "^src/domains/([^/]+)/",
        pathNot: "^src/domains/$1/",
      },
    },
    {
      name: "no-cross-web-feature",
      comment:
        "src/features/* não importam outra feature UI — orquestrar em app/.",
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
        "domains/, shared/, platform/, ui/ e features UI não podem importar de src/app/.",
      severity: "error",
      from: {
        path: "^(src/(domains|shared|platform|ui)/|src/features/)",
      },
      to: { path: "^src/app/" },
    },
    {
      name: "shared-no-features",
      comment: "shared/ é kernel transversal — não importa domains/ nem features UI.",
      severity: "error",
      from: { path: "^src/shared/" },
      to: {
        path: "^(src/domains/|src/features/)",
      },
    },
    {
      name: "server-no-features",
      comment: "platform/ (Better Auth) não importa domínios clínicos nem UI de features.",
      severity: "error",
      from: { path: "^src/platform/" },
      to: {
        path: "^(src/domains/|src/features/)",
      },
    },
    {
      name: "components-no-features",
      comment: "ui/ deve importar apenas shared/, nunca domains/ nem features UI.",
      severity: "error",
      from: { path: "^src/ui/" },
      to: {
        path: "^(src/domains/|src/features/)",
      },
    },
    {
      name: "domains-no-web-features",
      comment:
        "src/domains é server-oriented — não pode importar src/features nem UI web.",
      severity: "error",
      from: { path: "^src/domains/" },
      to: { path: "^src/features/" },
    },
    {
      name: "no-circular",
      comment: "Dependência circular — quebrar o ciclo (extrair tipos/leitura).",
      severity: "error",
      from: {
        path: "^src/",
        pathNot:
          "^src/domains/protocol/(evaluation-modules/|protocol\.(service|actions)\.ts$)",
      },
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
