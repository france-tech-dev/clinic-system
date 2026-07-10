"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfessionalAction } from "@/features/settings/settings.actions";
import type { ProfessionalProfile } from "@/features/settings/settings.types";

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
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Configurações</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Usados na assinatura dos relatórios impressos (avaliação, anamnese e
          prontuário).
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-md border border-border bg-card p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Dados do profissional
        </p>
        <div className="grid gap-1.5">
          <Label>Nome do terapeuta</Label>
          <Input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Seu nome completo"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Registro (CREFITO)</Label>
            <Input
              value={form.registro}
              onChange={(e) => setForm({ ...form, registro: e.target.value })}
              placeholder="Ex: CREFITO-3 000000-TO"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Clínica (opcional)</Label>
            <Input
              value={form.clinica}
              onChange={(e) => setForm({ ...form, clinica: e.target.value })}
              placeholder="Nome da clínica"
            />
          </div>
        </div>
        <Button disabled={pending} onClick={save}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
