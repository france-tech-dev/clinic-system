import { BRAND_LOGO } from "@/shared/constants/brand";
import { paths } from "@/shared/constants/paths";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movi Clínicas",
    short_name: "Movi",
    description:
      "Sistema de gestão clínica e agendamentos para profissionais da saúde.",
    start_url: paths.auth.login,
    scope: paths.root,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: BRAND_LOGO,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND_LOGO,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
