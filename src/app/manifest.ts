import type { MetadataRoute } from "next";
import { paths } from "@/shared/constants/paths";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOME DA EMPRESA AQUI",
    short_name: "EMPRESA",
    description:
      "NOME DA EMPRESA AQUI é um sistema interno para uso corporativo.",
    start_url: paths.auth.login,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo_dark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_dark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
