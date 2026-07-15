"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHealthProfession } from "@/shared/constants/professions";
import type { TeamMemberDTO } from "@/features/team/team.types";
import { CreateProfessionalDialog } from "./_components/create-professional-dialog";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Proprietário",
  owner: "Proprietário",
  ADMIN: "Administrador",
  admin: "Administrador",
  MANAGER: "Gestor",
  manager: "Gestor",
  MEMBER: "Membro",
  member: "Membro",
};

export function ProfissionaisClient({
  initialMembers,
}: {
  initialMembers: TeamMemberDTO[];
}) {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState(initialMembers);
  const [open, setOpen] = useState(() => searchParams.get("novo") === "1");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {members.length} na lista
        </p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Novo profissional
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum profissional cadastrado nesta clínica.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">E-mail</th>
                <th className="px-3 py-2 font-medium">Profissão</th>
                <th className="px-3 py-2 font-medium">Registro</th>
                <th className="px-3 py-2 font-medium">Papel</th>
                <th className="px-3 py-2 font-medium">Contato</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const profession = getHealthProfession(m.profession);
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-3 py-2">{m.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.email}
                    </td>
                    <td className="px-3 py-2">
                      {profession?.label ?? m.profession ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.registro ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {ROLE_LABEL[m.role] ?? m.role}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.phone ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateProfessionalDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={setMembers}
      />
    </div>
  );
}
