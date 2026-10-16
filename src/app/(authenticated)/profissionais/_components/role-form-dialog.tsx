"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogScrollableClassName,
  dialogScrollBodyClassName,
  dialogScrollFooterClassName,
  dialogScrollHeaderClassName,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createOrgRoleAction,
  updateOrgRoleAction,
} from "@/domains/team/org-role.actions";
import type { OrgRoleDTO, OrgRolePermissionMatrix } from "@/domains/team/org-role.types";
import { emptyPermissionMatrix } from "@/domains/team/_lib/default-org-role-permissions";
import { cn } from "@/shared/lib/utils";
import { RolePermissionMatrix } from "./role-permission-matrix";

function RoleFormBody({
  editing,
  onOpenChange,
  onSaved,
}: {
  editing: OrgRoleDTO | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (role: OrgRoleDTO) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [roleName, setRoleName] = useState(editing?.role ?? "");
  const [permission, setPermission] = useState<OrgRolePermissionMatrix>({
    ...emptyPermissionMatrix(),
    ...editing?.permission,
  });

  const isEdit = editing != null;
  const nameLocked = isEdit;

  function submit() {
    startTransition(async () => {
      if (isEdit && editing) {
        const result = await updateOrgRoleAction({
          roleId: editing.id ?? undefined,
          roleName: editing.role,
          permission,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        onSaved(result.data);
        onOpenChange(false);
        toast.success("Papel atualizado");
        return;
      }

      const result = await createOrgRoleAction({
        role: roleName.trim(),
        permission,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      onSaved(result.data);
      onOpenChange(false);
      toast.success("Papel criado");
    });
  }

  return (
    <>
      <DialogHeader className={dialogScrollHeaderClassName}>
        <DialogTitle>{isEdit ? "Editar papel" : "Novo papel"}</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Defina o nome e as permissões por módulo.
        </p>
      </DialogHeader>
      <div className={cn(dialogScrollBodyClassName, "flex flex-col gap-4")}>
        <div className="grid gap-2">
          <Label htmlFor="role-name">Nome do papel (slug)</Label>
          <Input
            id="role-name"
            value={roleName}
            disabled={nameLocked || pending}
            placeholder="ex. recepcionista"
            onChange={(e) => setRoleName(e.target.value)}
          />
          {!nameLocked ? (
            <p className="text-xs text-muted-foreground">
              Sem espaços — letras, números, _ ou -.
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label>Permissões</Label>
          <RolePermissionMatrix
            value={permission}
            onChange={setPermission}
            disabled={pending || editing?.system === true}
          />
        </div>
      </div>
      <DialogFooter className={dialogScrollFooterClassName}>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={
            pending ||
            editing?.system === true ||
            (!isEdit && !roleName.trim())
          }
        >
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {isEdit ? "Salvar" : "Criar papel"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function RoleFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: OrgRoleDTO | null;
  onSaved: (role: OrgRoleDTO) => void;
}) {
  const formKey = editing?.role ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogScrollableClassName, "sm:max-w-2xl")}>
        {open ? (
          <RoleFormBody
            key={formKey}
            editing={editing}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
