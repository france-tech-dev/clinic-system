import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { BuscarClient } from "./buscar-client";

export default function BuscarPage() {
  return (
    <>
      <SiteHeader title="Buscar" />
      <BuscarClient />
    </>
  );
}
