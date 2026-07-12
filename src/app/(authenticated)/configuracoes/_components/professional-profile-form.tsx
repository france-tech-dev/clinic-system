"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfessionalProfile } from "@/features/settings/settings.types";

export function ProfessionalProfileForm({
  form,
  onFormChange,
  pending,
  onSave,
}: {
  form: ProfessionalProfile;
  onFormChange: (form: ProfessionalProfile) => void;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <div className="max-w-lg space-y-4 rounded-md border border-border bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Dados do profissional
      </p>
      <div className="grid gap-1.5">
        <Label>Nome do terapeuta</Label>
        <Input
          value={form.nome}
          onChange={(e) => onFormChange({ ...form, nome: e.target.value })}
          placeholder="Seu nome completo"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Registro (CREFITO)</Label>
          <Input
            value={form.registro}
            onChange={(e) => onFormChange({ ...form, registro: e.target.value })}
            placeholder="Ex: CREFITO-3 000000-TO"
          />
        </div>
      </div>
      <Button disabled={pending} onClick={onSave}>
        Salvar
      </Button>
    </div>
  );
}
