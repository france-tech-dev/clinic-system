"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteOrgRoleAction } from "@/domains/team/org-role.actions";
import type { OrgRoleDTO } from "@/domains/team/org-role.types";
import {
  countActions,
  totalResourcesWithAny,
} from "@/domains/team/_lib/default-org-role-permissions";
import { CLINIC_RESOURCES } from "@/shared/lib/permissions";
import { RoleFormDialog } from "./role-form-dialog";

function RoleCard({
  role,
  onEdit,
  onDeleted,
}: {
  role: OrgRoleDTO;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const total = CLINIC_RESOURCES.length;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOrgRoleAction({
        roleId: role.id ?? undefined,
        roleName: role.role,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      onDeleted();
      toast.success("Papel excluído");
    });
  }

  return (
    <Card size="sm">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{role.label}</CardTitle>
          <CardDescription>
            {role.memberCount}{" "}
            {role.memberCount === 1 ? "usuário" : "usuários"}
            {role.system ? " · sistema" : role.preset ? " · padrão" : ""}
          </CardDescription>
        </div>
        {!role.system ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Opções de ${role.label}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
              {!role.preset ? (
                <DeleteConfirmDialog
                  onConfirm={handleDelete}
                  disabled={pending}
                >
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DeleteConfirmDialog>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-5 gap-1 text-center text-xs">
          {(
            [
              ["Ler", countActions(role.permission, "read")],
              ["Editar", countActions(role.permission, "update")],
              ["Criar", countActions(role.permission, "create")],
              ["Excluir", countActions(role.permission, "delete")],
              ["Total", totalResourcesWithAny(role.permission)],
            ] as const
          ).map(([label, n]) => (
            <div key={label} className="rounded-md bg-muted/50 px-1 py-2">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">
                {n}
                <span className="text-muted-foreground font-normal">
                  /{total}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        {role.system ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={onEdit}
          >
            Configurar permissões
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function RolesPanel({
  initialRoles,
  onRolesChange,
}: {
  initialRoles: OrgRoleDTO[];
  onRolesChange?: (roles: OrgRoleDTO[]) => void;
}) {
  const [roles, setRoles] = useState(initialRoles);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OrgRoleDTO | null>(null);

  function commitRoles(next: OrgRoleDTO[]) {
    setRoles(next);
    onRolesChange?.(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Defina papéis e o que cada um pode ver e fazer na clínica.
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Novo papel
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <RoleCard
            key={role.role}
            role={role}
            onEdit={() => {
              setEditing(role);
              setFormOpen(true);
            }}
            onDeleted={() =>
              commitRoles(roles.filter((r) => r.role !== role.role))
            }
          />
        ))}
        <Card size="sm" className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Adicionar papel</CardTitle>
            <CardDescription>
              Crie um papel se ainda não existir (ex. recepcionista).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus data-icon="inline-start" />
              Novo papel
            </Button>
          </CardContent>
        </Card>
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSaved={(role) => {
          const idx = roles.findIndex((r) => r.role === role.role);
          if (idx === -1) {
            commitRoles([...roles, role]);
            return;
          }
          const next = [...roles];
          next[idx] = role;
          commitRoles(next);
        }}
      />
    </div>
  );
}
