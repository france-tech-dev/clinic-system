"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProfessionalAction } from "@/features/settings/settings.actions";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { ClinicBrandingForm } from "./_components/clinic-branding-form";
import { ProfessionalProfileForm } from "./_components/professional-profile-form";

export function ConfiguracoesClient({
  initial,
  branding,
}: {
  initial: ProfessionalProfile;
  branding: PrintBranding;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveProfessionalAction(form);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setForm(result.data);
      toast.success("Dados do profissional salvos");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <ClinicBrandingForm initial={branding} />

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Usados na assinatura dos relatórios PDF (avaliação, anamnese e
          prontuário).
        </p>
        <ProfessionalProfileForm
          form={form}
          onFormChange={setForm}
          pending={pending}
          onSave={save}
        />
      </div>
    </div>
  );
}
