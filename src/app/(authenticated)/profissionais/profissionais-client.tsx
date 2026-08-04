"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProfessionalAction } from "@/features/team/team.actions";
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

function MemberActions({
  member,
  canDelete,
  pending,
  onEdit,
  onDelete,
}: {
  member: TeamMemberDTO;
  canDelete: boolean;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${member.name}`}
        onClick={onEdit}
      >
        <Pencil className="size-4" />
      </Button>
      {canDelete ? (
        <DeleteConfirmDialog onConfirm={onDelete} disabled={pending}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${member.name}`}
            disabled={pending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </DeleteConfirmDialog>
      ) : null}
    </div>
  );
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
        <Button className="w-full sm:w-auto" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Novo profissional
        </Button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum profissional cadastrado nesta clínica.
        </p>
      ) : (
        <>
          <div className="hidden rounded-md border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Profissão</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const profession = getHealthProfession(m.profession);
                  const inactive = m.status === "inactive";
                  const canDelete =
                    !isOwnerRole(m.role) && m.userId !== currentUserId;
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.email}
                      </TableCell>
                      <TableCell>
                        {profession?.label ?? m.profession ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.registration ?? "—"}
                      </TableCell>
                      <TableCell>{ROLE_LABEL[m.role] ?? m.role}</TableCell>
                      <TableCell>
                        <Badge variant={inactive ? "secondary" : "outline"}>
                          {inactive ? "Inativo" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <MemberActions
                          member={m}
                          canDelete={canDelete}
                          pending={pending}
                          onEdit={() => setEditing(m)}
                          onDelete={() => handleDelete(m)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ItemGroup data-size="sm" className="md:hidden">
            {members.map((m) => {
              const profession = getHealthProfession(m.profession);
              const inactive = m.status === "inactive";
              const canDelete =
                !isOwnerRole(m.role) && m.userId !== currentUserId;
              return (
                <Item
                  key={m.id}
                  variant="outline"
                  role="listitem"
                  className="flex-col items-stretch bg-card"
                >
                  <ItemHeader>
                    <ItemContent>
                      <ItemTitle>{m.name}</ItemTitle>
                      <ItemDescription>{m.email}</ItemDescription>
                    </ItemContent>
                    <Badge variant={inactive ? "secondary" : "outline"}>
                      {inactive ? "Inativo" : "Ativo"}
                    </Badge>
                  </ItemHeader>
                  <dl className="grid w-full gap-1.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Profissão</dt>
                      <dd className="text-right">
                        {profession?.label ?? m.profession ?? "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Registro</dt>
                      <dd className="text-right">{m.registration ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Papel</dt>
                      <dd className="text-right">
                        {ROLE_LABEL[m.role] ?? m.role}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Contato</dt>
                      <dd className="text-right">{m.phone ?? "—"}</dd>
                    </div>
                  </dl>
                  <ItemFooter className="border-t border-border pt-2">
                    <ItemActions className="w-full justify-end">
                      <MemberActions
                        member={m}
                        canDelete={canDelete}
                        pending={pending}
                        onEdit={() => setEditing(m)}
                        onDelete={() => handleDelete(m)}
                      />
                    </ItemActions>
                  </ItemFooter>
                </Item>
              );
            })}
          </ItemGroup>
        </>
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
