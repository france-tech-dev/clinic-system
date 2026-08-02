"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  deleteProfessionalAction,
} from "@/features/team/team.actions";
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

function isOwnerRole(role: string) {
  return role === "OWNER" || role === "owner";
}

export function ProfissionaisClient({
  initialMembers,
  currentUserId,
}: {
  initialMembers: TeamMemberDTO[];
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState(initialMembers);
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("novo") === "1",
  );
  const [editing, setEditing] = useState<TeamMemberDTO | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete(member: TeamMemberDTO) {
    startTransition(async () => {
      const result = await deleteProfessionalAction({ memberId: member.id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("Profissional removido da clínica.");
    });
  }

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
                const inactive = m.status === "inactive";
                const canDelete =
                  !isOwnerRole(m.role) && m.userId !== currentUserId;
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
                      {m.registration ?? "—"}
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
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Editar ${m.name}`}
                          onClick={() => setEditing(m)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {canDelete ? (
                          <DeleteConfirmDialog
                            onConfirm={() => handleDelete(m)}
                            disabled={pending}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Excluir ${m.name}`}
                              disabled={pending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </DeleteConfirmDialog>
                        ) : null}
                      </div>
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
