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

  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-links-publicos"
      aria-labelledby="patient-tab-links-publicos"
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Links para responsáveis preencherem avaliações fora da clínica.
        </p>
        {canWriteInvites && inviteProtocols.length > 0 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setInviteOpen(true)}
          >
            <Link2 data-icon="inline-start" />
            Gerar link de avaliação
          </Button>
        ) : null}
      </div>

      <ProtocolInviteStatusList
        invites={invites}
        canManage={canWriteInvites}
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
