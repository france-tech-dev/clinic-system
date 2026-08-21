"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { createProtocolInviteAction } from "@/features/protocol/invite/protocol-invite.actions";
import type { ProtocolInviteDTO } from "@/features/protocol/invite/protocol-invite.types";

export type PublicInviteProtocolOption = {
  id: string;
  name: string;
  description: string;
};

export function CreateProtocolInviteDialog({
  patientId,
  protocols,
  open,
  onOpenChange,
  onCreated,
}: {
  patientId: string;
  protocols: PublicInviteProtocolOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (invite: ProtocolInviteDTO) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelected([]);
      setCreatedUrl(null);
    }
    onOpenChange(next);
  }

  function onCreate() {
    startTransition(async () => {
      const result = await createProtocolInviteAction({
        patientId,
        protocolIds: selected,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setCreatedUrl(result.data.publicUrl);
      onCreated(result.data);
      toast.success("Link gerado");
    });
  }

  async function copyUrl() {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerar link de avaliação</DialogTitle>
          <DialogDescription>
            O responsável preenche os instrumentos seleccionados sem precisar de
            login. O link expira em 30 dias.
          </DialogDescription>
        </DialogHeader>

        {createdUrl ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">
              Partilhe este link com o responsável:
            </p>
            <code className="break-all rounded-md border border-border bg-muted/40 px-3 py-2 text-xs">
              {createdUrl}
            </code>
            <Button type="button" onClick={copyUrl}>
              <Link2 data-icon="inline-start" />
              Copiar link
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {protocols.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum instrumento disponível para link público.
              </p>
            ) : (
              protocols.map((protocol) => {
                const checked = selected.includes(protocol.id);
                return (
                  <label
                    key={protocol.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(protocol.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {protocol.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {protocol.description}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}

        <DialogFooter>
          {createdUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Fechar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onCreate}
                disabled={pending || selected.length === 0}
              >
                {pending ? <Spinner data-icon="inline-start" /> : null}
                Gerar link
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
