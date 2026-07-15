import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { CreateOrganizationForm } from "@/components/auth/create-organization-form";
import { getOrganizations } from "@/server/organizations/organizations";
import { paths } from "@/shared/constants/paths";
import Link from "next/link";

export default async function OrganizacaoPage() {
  const organizations = await getOrganizations();
  const hasOrgs = organizations.length > 0;

  return (
    <AppPage title="Nova clínica">
      <div className="flex flex-col gap-6">
        <div className="max-w-lg">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            {hasOrgs ? "Criar outra clínica" : "Crie a sua clínica"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasOrgs
              ? "Cada clínica tem pacientes e agenda próprios."
              : "Para usar o Fichário, precisa de uma clínica (organização). Os dados ficam isolados por clínica."}
          </p>
        </div>

        <div className="max-w-lg rounded-md border border-border bg-card p-4 sm:p-6">
          <CreateOrganizationForm />
        </div>

        {hasOrgs && (
          <p className="text-sm text-muted-foreground">
            Já tem clínicas?{" "}
            <Link href={paths.painel} className="text-primary hover:underline">
              Voltar ao painel
            </Link>{" "}
            e escolha no seletor da barra lateral.
          </p>
        )}
      </div>
    </AppPage>
  );
}
