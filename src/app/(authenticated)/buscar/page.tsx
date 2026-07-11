import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { BuscarClient } from "./buscar-client";

export default function BuscarPage() {
  return (
    <AppPage title="Buscar">
      <BuscarClient />
    </AppPage>
  );
}
