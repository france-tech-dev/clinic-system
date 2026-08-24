"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeProtocolInviteAction } from "@/features/protocol/invite/protocol-invite.actions";
import type { ProtocolInviteDTO } from "@/features/protocol/invite/protocol-invite.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

function statusLabel(invite: ProtocolInviteDTO): string {
  if (invite.isRevoked) return "Revogado";
  if (invite.isExpired) return "Expirado";
  if (invite.allSubmitted) return "Completo";
  const submitted = invite.items.filter((i) => i.status === "submitted").length;
  if (submitted > 0) return "Parcial";
  return "Pendente";
}

export function ProtocolInviteStatusList({
  invites,
  onChange,
  canManage,
}: {
  invites: ProtocolInviteDTO[];
  onChange: (invites: ProtocolInviteDTO[]) => void;
  canManage: boolean;
}) {
  const [pending, startTransition] = useTransition();

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function revoke(id: string) {
    startTransition(async () => {
      const result = await revokeProtocolInviteAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      onChange(
        invites.map((invite) => (invite.id === id ? result.data : invite)),
      );
      toast.success("Link revogado");
    });
  }

  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há links públicos para este paciente.
      </p>
    );
  }

  return (
    <ul className="grid gap-2">
      {invites.map((invite) => {
        const submitted = invite.items.filter(
          (i) => i.status === "submitted",
        ).length;
        return (
          <li
            key={invite.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{statusLabel(invite)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {submitted}/{invite.items.length} instrumentos · criado{" "}
                  {formatDateBR(invite.createdAt.slice(0, 10))}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {invite.items.map((i) => i.protocolName).join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {invite.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copy(invite.publicUrl)}
                >
                  Copiar link
                </Button>
              ) : null}
              {canManage && invite.isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => revoke(invite.id)}
                >
                  Revogar
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
