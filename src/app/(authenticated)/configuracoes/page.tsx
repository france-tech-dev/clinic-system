import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  getCurrentMemberProfessionalProfile,
  getPrintBranding,
  getProfessionalProfile,
} from "@/features/settings/settings.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  let error: string | null = null;
  let profile = { nome: "", registro: "", clinica: "" };
  let memberProfile = { nome: "", registro: "", clinica: "" };
  let branding = { clinicName: "Clinic System", logoUrl: "/logo_dark.png" };

  try {
    const { organizationId, userId } = await requireOrgId();
    [profile, memberProfile, branding] = await Promise.all([
      getProfessionalProfile(organizationId),
      getCurrentMemberProfessionalProfile(organizationId, userId),
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
        <ConfiguracoesClient
          initial={profile}
          memberInitial={memberProfile}
          branding={branding}
        />
      )}
    </AppPage>
  );
}
