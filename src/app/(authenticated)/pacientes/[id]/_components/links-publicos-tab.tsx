"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CreateProtocolInviteDialog,
  type PublicInviteProtocolOption,
} from "@/features/protocol/components/create-protocol-invite-dialog";
import { ProtocolInviteStatusList } from "@/features/protocol/components/protocol-invite-status";
import type { ProtocolInviteDTO } from "@/features/protocol/invite/protocol-invite.types";

export function LinksPublicosTab({
  patientId,
  initialInvites,
  inviteProtocols,
  canWriteInvites,
}: {
  patientId: string;
  initialInvites: ProtocolInviteDTO[];
  inviteProtocols: PublicInviteProtocolOption[];
  canWriteInvites: boolean;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invites, setInvites] = useState(initialInvites);
  const canCreate = canWriteInvites && inviteProtocols.length > 0;

  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-links-publicos"
      aria-labelledby="patient-tab-links-publicos"
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-medium">Links enviados</h2>
          <p className="text-sm text-muted-foreground sm:max-w-prose">
            <span className="sm:hidden">
              Acompanhe respostas e limpe links inativos.
            </span>
            <span className="hidden sm:inline">
              Acompanhe o preenchimento pelos responsáveis, abra as respostas e
              limpe links inativos.
            </span>
          </p>
        </div>
        {canCreate ? (
          <Button
            type="button"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={() => setInviteOpen(true)}
          >
            <Link2 data-icon="inline-start" />
            Novo link
          </Button>
        ) : canWriteInvites ? (
          <p className="text-xs text-muted-foreground">
            Nenhum instrumento disponível para link público.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Geração de links fora do plano actual.
          </p>
        )}
      </div>

      <ProtocolInviteStatusList
        invites={invites}
        canManage={canWriteInvites}
        canCreate={canCreate}
        onCreate={() => setInviteOpen(true)}
        onChange={setInvites}
      />

      <CreateProtocolInviteDialog
        patientId={patientId}
        protocols={inviteProtocols}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={(invite) => setInvites((prev) => [invite, ...prev])}
      />
    </section>
  );
}
