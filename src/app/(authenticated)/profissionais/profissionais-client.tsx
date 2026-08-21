"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Item,
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
import { AssignMemberPatientsDialog } from "@/features/team/components/assign-member-patients-dialog";
import { MemberPatientsIndicator } from "@/features/team/components/member-patients-indicator";
import {
  deleteProfessionalAction,
  setMemberPatientsAction,
} from "@/features/team/team.actions";
import type {
  AssignablePatientOption,
  TeamMemberDTO,
} from "@/features/team/team.types";
import { getHealthProfession } from "@/shared/constants/professions";
import { memberRoleLabel } from "@/shared/constants/member-role";
import { memberStatusLabel } from "@/shared/constants/member-status";
import { initialsFromName } from "@/shared/lib/initials-from-name";
import { Role, MemberStatus } from "../../../../prisma/generated/prisma/enums";
import { CreateProfessionalDialog } from "./_components/create-professional-dialog";
import { EditProfessionalDialog } from "./_components/edit-professional-dialog";

function isOwnerRole(role: Role) {
  return role === Role.OWNER;
}

function MemberAvatar({ member }: { member: TeamMemberDTO }) {
  return (
    <Avatar size="sm">
      {member.imageUrl ? (
        <AvatarImage src={member.imageUrl} alt={member.name} />
      ) : null}
      <AvatarFallback>{initialsFromName(member.name)}</AvatarFallback>
    </Avatar>
  );
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
        size="icon"
        className="md:size-7"
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
            size="icon"
            className="text-destructive hover:text-destructive md:size-7"
            aria-label={`Excluir ${member.name}`}
            disabled={pending}
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
  assignablePatients,
  currentUserId,
  isLeadership,
}: {
  initialMembers: TeamMemberDTO[];
  assignablePatients: AssignablePatientOption[];
  currentUserId: string;
  isLeadership: boolean;
}) {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState(initialMembers);
  const [createOpen, setCreateOpen] = useState(
    () => searchParams.get("novo") === "1",
  );
  const [editing, setEditing] = useState<TeamMemberDTO | null>(null);
  const [assignMember, setAssignMember] = useState<TeamMemberDTO | null>(null);
  const [pending, startTransition] = useTransition();
  const [patientsPending, startPatientsTransition] = useTransition();

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

  function savePatients(patientIds: string[]) {
    if (!assignMember) return;
    const memberId = assignMember.id;
    startPatientsTransition(async () => {
      const result = await setMemberPatientsAction({ memberId, patientIds });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? result.data : m)),
      );
      setAssignMember(null);
      toast.success("Pacientes atualizados");
    });
  }

  return (
    <AppPage
      title="Profissionais"
      rightContent={
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus data-icon="inline-start" />
          Novo profissional
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Equipa da clínica — profissionais que atendem e acedem ao painel.
          </p>
          <p className="text-sm text-muted-foreground">
            {members.length} na lista
          </p>
        </div>

        {members.length === 0 ? (
          <div className="space-y-3 rounded-md border border-border bg-card px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não há profissionais nesta clínica.
            </p>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              Cadastrar primeiro profissional
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden rounded-md border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-30">
                      <span className="sr-only">Pacientes</span>
                      Pacientes
                    </TableHead>
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
                  {members.map((member) => {
                    const profession = getHealthProfession(member.profession);
                    const inactive = member.status === MemberStatus.INACTIVE;
                    const canDelete =
                      !isOwnerRole(member.role) &&
                      member.userId !== currentUserId;
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MemberAvatar member={member} />
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <MemberPatientsIndicator
                            memberName={member.name}
                            patients={member.patients}
                            canEdit={isLeadership}
                            disabled={patientsPending}
                            onEdit={() => setAssignMember(member)}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          {profession?.label ?? member.profession ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.registration ?? "—"}
                        </TableCell>
                        <TableCell>
                          {memberRoleLabel(member.role)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={inactive ? "secondary" : "outline"}>
                            {memberStatusLabel(member.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          <MemberActions
                            member={member}
                            canDelete={canDelete}
                            pending={pending}
                            onEdit={() => setEditing(member)}
                            onDelete={() => handleDelete(member)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <ItemGroup data-size="sm" className="md:hidden">
              {members.map((member) => {
                const profession = getHealthProfession(member.profession);
                const inactive = member.status === MemberStatus.INACTIVE;
                const canDelete =
                  !isOwnerRole(member.role) && member.userId !== currentUserId;
                return (
                  <Item
                    key={member.id}
                    variant="outline"
                    role="listitem"
                    className="flex-col items-stretch bg-card"
                  >
                    <ItemHeader>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <MemberAvatar member={member} />
                        <ItemContent>
                          <ItemTitle>{member.name}</ItemTitle>
                          <ItemDescription>{member.email}</ItemDescription>
                        </ItemContent>
                      </div>
                      <Badge variant={inactive ? "secondary" : "outline"}>
                        {memberStatusLabel(member.status)}
                      </Badge>
                    </ItemHeader>
                    <dl className="grid w-full gap-1.5 text-sm">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Profissão</dt>
                        <dd className="text-right">
                          {profession?.label ?? member.profession ?? "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Registro</dt>
                        <dd className="text-right">
                          {member.registration ?? "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Papel</dt>
                        <dd className="text-right">
                          {memberRoleLabel(member.role)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Contato</dt>
                        <dd className="text-right">{member.phone ?? "—"}</dd>
                      </div>
                    </dl>
                    <ItemFooter className="border-t border-border pt-2">
                      <div className="flex w-full items-center justify-between gap-2">
                        <MemberPatientsIndicator
                          memberName={member.name}
                          patients={member.patients}
                          canEdit={isLeadership}
                          disabled={patientsPending}
                          onEdit={() => setAssignMember(member)}
                        />
                        <MemberActions
                          member={member}
                          canDelete={canDelete}
                          pending={pending}
                          onEdit={() => setEditing(member)}
                          onDelete={() => handleDelete(member)}
                        />
                      </div>
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

        {assignMember ? (
          <AssignMemberPatientsDialog
            open
            onOpenChange={(next) => {
              if (!next) setAssignMember(null);
            }}
            memberName={assignMember.name}
            patients={assignablePatients}
            initialPatientIds={assignMember.patients.map((p) => p.id)}
            pending={patientsPending}
            onSave={savePatients}
          />
        ) : null}
      </div>
    </AppPage>
  );
}
