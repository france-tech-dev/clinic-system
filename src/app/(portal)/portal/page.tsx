import Link from "next/link";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";

/** Stub do portal do responsável (Role.CLIENT) — UI completa em breve. */
export default function PortalPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-12">
      <h1 className="font-serif text-2xl">Portal do responsável</h1>
      <p className="text-sm text-muted-foreground">
        Em breve poderá acompanhar aqui o desenvolvimento dos pacientes sob a
        sua responsabilidade. A conta já está preparada com o papel de
        responsável.
      </p>
      <Button variant="outline" asChild>
        <Link href={paths.auth.logout}>Sair</Link>
      </Button>
    </main>
  );
}
