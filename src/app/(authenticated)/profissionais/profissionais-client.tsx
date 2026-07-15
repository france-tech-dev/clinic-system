"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHealthProfession } from "@/shared/constants/professions";
import type { TeamMemberDTO } from "@/features/team/team.types";
import { CreateProfessionalDialog } from "./_components/create-professional-dialog";
import { EditProfessionalDialog } from "./_components/edit-professional-dialog";

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
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("novo") === "1",
  );
  const [editing, setEditing] = useState<TeamMemberDTO | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {members.length} na lista
        </p>
        <Button onClick={() => setCreateOpen(true)}>
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
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Contato</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const profession = getHealthProfession(m.profession);
                const inactive = m.status === "inativo";
                return (
                  <tr
                    key={m.id}
                    className="border-t border-border"
                  >
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
                    <td className="px-3 py-2">
                      <Badge variant={inactive ? "secondary" : "outline"}>
                        {inactive ? "Inativo" : "Ativo"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {m.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${m.name}`}
                        onClick={() => setEditing(m)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateProfessionalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={setMembers}
      />

      <EditProfessionalDialog
        member={editing}
        open={editing != null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onUpdated={setMembers}
      />
    </div>
  );
}
