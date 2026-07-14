"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  saveCurrentMemberProfessionalAction,
  saveProfessionalAction,
} from "@/features/settings/settings.actions";
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
  const [orgForm, setOrgForm] = useState(initial);
  const [memberForm, setMemberForm] = useState(memberInitial);
  const [pending, startTransition] = useTransition();

  function saveOrg() {
    startTransition(async () => {
      const result = await saveProfessionalAction(orgForm);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setOrgForm(result.data);
      toast.success("Perfil da clínica salvo");
    });
  }

  function saveMember() {
    startTransition(async () => {
      const result = await saveCurrentMemberProfessionalAction({
        nome: memberForm.nome,
        registro: memberForm.registro,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setMemberForm({ ...result.data, clinica: "" });
      toast.success("Seu CREFITO foi salvo");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <ClinicBrandingForm initial={branding} />

      <div className="space-y-4">
        <ProfessionalProfileForm
          form={memberForm}
          onFormChange={setMemberForm}
          pending={pending}
          onSave={saveMember}
          title="Meu CREFITO"
          description="Usado na assinatura dos PDFs das avaliações que você criar. Cada profissional configura o seu."
        />

        <ProfessionalProfileForm
          form={orgForm}
          onFormChange={setOrgForm}
          pending={pending}
          onSave={saveOrg}
          title="Fallback da clínica"
          description="Assinatura padrão quando a avaliação não tem autor com CREFITO, ou em relatórios gerais (anamnese, prontuário completo)."
        />
      </div>
    </div>
  );
}
