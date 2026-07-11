"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProfessionalAction } from "@/features/settings/settings.actions";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
import { ProfessionalProfileForm } from "./_components/professional-profile-form";

export function ConfiguracoesClient({
  initial,
}: {
  initial: ProfessionalProfile;
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Usados na assinatura dos relatórios impressos (avaliação, anamnese e
          prontuário).
        </p>
      </div>

      <ProfessionalProfileForm
        form={form}
        onFormChange={setForm}
        pending={pending}
        onSave={save}
      />
    </div>
  );
}
