import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { getProfessionalProfile } from "@/features/settings/settings.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  let error: string | null = null;
  let profile = { nome: "", registro: "", clinica: "" };

  try {
    const { organizationId } = await requireOrgId();
    profile = await getProfessionalProfile(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as configurações.";
  }

  return (
    <>
      <SiteHeader title="Configurações" />
      {error ? (
        <div className="p-6 text-sm text-destructive">{error}</div>
      ) : (
        <ConfiguracoesClient initial={profile} />
      )}
    </>
  );
}
