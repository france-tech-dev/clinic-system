"use client";

import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { ClinicBrandingForm } from "./_components/clinic-branding-form";
import { ProfessionalProfileForm } from "./_components/professional-profile-form";

export function ConfiguracoesClient({
  initial,
  memberInitial,
  branding,
}: {
  initial: ProfessionalProfile;
  memberInitial: ProfessionalProfile;
  branding: PrintBranding;
}) {
  return (
    <div className="flex flex-col gap-8">
      <ClinicBrandingForm initial={branding} />

      <div className="space-y-4">
        <ProfessionalProfileForm
          mode="member"
          initial={memberInitial}
          title="Meu CREFITO"
          description="Usado na assinatura dos PDFs das avaliações que você criar. Cada profissional configura o seu."
        />

        <ProfessionalProfileForm
          mode="org"
          initial={initial}
          title="Fallback da clínica"
          description="Assinatura padrão quando a avaliação não tem autor com CREFITO, ou em relatórios gerais (anamnese, prontuário completo)."
        />
      </div>
    </div>
  );
}
