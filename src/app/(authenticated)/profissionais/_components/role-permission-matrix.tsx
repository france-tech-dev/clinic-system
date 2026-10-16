"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrgRolePermissionMatrix } from "@/domains/team/org-role.types";
import {
  CLINIC_ACTIONS,
  CLINIC_RESOURCE_LABEL,
  CLINIC_RESOURCES,
  type ClinicAction,
  type ClinicResource,
} from "@/shared/lib/permissions";

const ACTION_LABEL: Record<ClinicAction, string> = {
  read: "Ler",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
};

export function RolePermissionMatrix({
  value,
  onChange,
  disabled = false,
}: {
  value: OrgRolePermissionMatrix;
  onChange: (next: OrgRolePermissionMatrix) => void;
  disabled?: boolean;
}) {
  function toggle(resource: ClinicResource, action: ClinicAction) {
    const current = new Set(value[resource] ?? []);
    if (current.has(action)) current.delete(action);
    else current.add(action);
    onChange({
      ...value,
      [resource]: CLINIC_ACTIONS.filter((a) => current.has(a)),
    });
  }

  function toggleRow(resource: ClinicResource) {
    const current = value[resource] ?? [];
    const allOn = CLINIC_ACTIONS.every((a) => current.includes(a));
    onChange({
      ...value,
      [resource]: allOn ? [] : [...CLINIC_ACTIONS],
    });
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Recurso</TableHead>
            <TableHead className="w-12 text-center">Tudo</TableHead>
            {CLINIC_ACTIONS.map((action) => (
              <TableHead key={action} className="w-18 text-center">
                {ACTION_LABEL[action]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {CLINIC_RESOURCES.map((resource) => {
            const actions = value[resource] ?? [];
            const allOn = CLINIC_ACTIONS.every((a) => actions.includes(a));
            return (
              <TableRow key={resource}>
                <TableCell className="font-medium">
                  {CLINIC_RESOURCE_LABEL[resource]}
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={allOn}
                    disabled={disabled}
                    onCheckedChange={() => toggleRow(resource)}
                    aria-label={`Todas as ações em ${CLINIC_RESOURCE_LABEL[resource]}`}
                  />
                </TableCell>
                {CLINIC_ACTIONS.map((action) => (
                  <TableCell key={action} className="text-center">
                    <Checkbox
                      checked={actions.includes(action)}
                      disabled={disabled}
                      onCheckedChange={() => toggle(resource, action)}
                      aria-label={`${ACTION_LABEL[action]} ${CLINIC_RESOURCE_LABEL[resource]}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
