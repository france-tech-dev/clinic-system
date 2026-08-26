"use client";

import { ProfessionalProfileForm } from "@/features/settings/components/professional-profile-form";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/domains/settings/settings.types";
import { ClinicBrandingForm } from "./_components/clinic-branding-form";

export function ConfiguracoesClient({
  orgInitial,
  branding,
}: {
  orgInitial: ProfessionalProfile;
  branding: PrintBranding;
}) {
  return (
    <div
      className="flex max-w-lg flex-col gap-6"
      aria-labelledby="identidade-clinica-heading"
    >
      <div className="flex flex-col gap-1">
        <h2 id="identidade-clinica-heading" className="text-base font-semibold">
          Identidade da clínica
        </h2>
        <p className="text-sm text-muted-foreground">
          Cabeçalho e assinatura padrão dos relatórios PDF. O seu registo
          pessoal fica em Perfil.
        </p>
      </div>

      <ClinicBrandingForm initial={branding} />

      <ProfessionalProfileForm
        mode="org"
        initial={orgInitial}
        title="Assinatura padrão da clínica"
        description="Usada quando a avaliação não tem autor com registo próprio, ou em relatórios gerais (anamnese, prontuário completo)."
        saveLabel="Salvar assinatura padrão"
      />
    </div>
  );
}
