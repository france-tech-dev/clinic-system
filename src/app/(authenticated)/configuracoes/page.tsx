import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  let error: string | null = null;
  let profile = { nome: "", registro: "", clinica: "" };
  let branding = { clinicName: "Fichário TO", logoUrl: "/paris.png" };

  try {
    const { organizationId } = await requireOrgId();
    [profile, branding] = await Promise.all([
      getProfessionalProfile(organizationId),
      getPrintBranding(organizationId),
    ]);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as configurações.";
  }

  return (
    <AppPage title="Configurações">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <ConfiguracoesClient initial={profile} branding={branding} />
      )}
    </AppPage>
  );
}
