import type { MetadataRoute } from "next";
import { paths } from "@/shared/constants/paths";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movi Clinicas",
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
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
