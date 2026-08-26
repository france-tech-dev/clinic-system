import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/domains/settings/settings.service";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/domains/settings/settings.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { EMPTY_PROFESSIONAL } from "@/shared/types/professional";
import { DEFAULT_PRINT_LOGO } from "@/shared/constants/brand";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  let error: string | null = null;
  let orgProfile: ProfessionalProfile = EMPTY_PROFESSIONAL;
  let branding: PrintBranding = {
    clinicName: "",
    logoUrl: DEFAULT_PRINT_LOGO,
  };

  try {
    const { organizationId } = await requireOrgId();
    const [org, print] = await Promise.all([
      getProfessionalProfile(organizationId),
      getPrintBranding(organizationId),
    ]);
    orgProfile = org;
    branding = print;
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar as configurações.";
  }

  return (
    <AppPage title="Configurações">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <ConfiguracoesClient orgInitial={orgProfile} branding={branding} />
      )}
    </AppPage>
  );
}
