"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  List,
  Send,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteProtocolInviteAction,
  revokeProtocolInviteAction,
} from "@/domains/protocol/invite/protocol-invite.actions";
import {
  countInviteBuckets,
  filterInvites,
  inviteListBucket,
  type InviteListFilter,
} from "@/domains/protocol/invite/_lib/invite-list-filter";
import type { ProtocolInviteDTO } from "@/domains/protocol/invite/protocol-invite.types";
import { getProtocolEvaluationPreviewAction } from "@/domains/protocol/protocol.actions";
import type { ProtocolEvaluationPreviewDTO } from "@/domains/protocol/protocol.types";
import { cn } from "@/shared/lib/utils";
import { ProtocolInviteResultsDialog } from "./protocol-invite-results-dialog";

const PAGE_SIZE = 8;

const FILTERS: Array<{ id: InviteListFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendentes" },
  { id: "responded", label: "Respondidos" },
  { id: "inactive", label: "inativos" },
];

function formatInviteDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function inviteInstrumentTitle(invite: ProtocolInviteDTO): string {
  const names = invite.items.map((item) => item.protocolName);
  if (names.length === 0) return "Sem instrumentos";
  if (names.length <= 2) return names.join(" · ");
  return `${names[0]} · +${names.length - 1}`;
}

function statusMeta(invite: ProtocolInviteDTO): {
  label: string;
  badgeClass: string;
  Icon: typeof Send;
  iconClass: string;
} {
  if (invite.isRevoked) {
    return {
      label: "Revogado",
      badgeClass: "border-transparent bg-muted text-muted-foreground",
      Icon: Ban,
      iconClass: "text-muted-foreground",
    };
  }
  if (invite.isExpired) {
    return {
      label: "Expirado",
      badgeClass:
        "border-transparent bg-amber-500/15 text-amber-900 dark:text-amber-100",
      Icon: Clock3,
      iconClass: "text-amber-700 dark:text-amber-300",
    };
  }
  if (invite.allSubmitted) {
    return {
      label: "Respondido",
      badgeClass:
        "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
      Icon: CheckCircle2,
      iconClass: "text-emerald-600 dark:text-emerald-400",
    };
  }
  return {
    label: "Pendente",
    badgeClass:
      "border-transparent bg-yellow-500/15 text-yellow-900 dark:text-yellow-100",
    Icon: Send,
    iconClass: "text-primary",
  };
}

export function ProtocolInviteStatusList({
  invites,
  onChange,
  canManage,
  canCreate,
  onCreate,
  canUseAi,
}: {
  invites: ProtocolInviteDTO[];
  onChange: (invites: ProtocolInviteDTO[]) => void;
  canManage: boolean;
  canCreate?: boolean;
  onCreate?: () => void;
  canUseAi: boolean;
}) {
  const [filter, setFilter] = useState<InviteListFilter>("all");
  const [page, setPage] = useState(0);
  const [listPending, startListTransition] = useTransition();
  const [previewPending, startPreviewTransition] = useTransition();
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<
    ProtocolInviteDTO["items"]
  >([]);
  const [previewEvalId, setPreviewEvalId] = useState<string | null>(null);
  const [previewData, setPreviewData] =
    useState<ProtocolEvaluationPreviewDTO | null>(null);

  const counts = useMemo(() => countInviteBuckets(invites), [invites]);
  const filtered = useMemo(
    () => filterInvites(invites, filter),
    [invites, filter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  function setFilterAndReset(next: InviteListFilter) {
    setFilter(next);
    setPage(0);
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function loadEvaluation(evaluationId: string) {
    setPreviewEvalId(evaluationId);
    setPreviewData(null);
    startPreviewTransition(async () => {
      const result = await getProtocolEvaluationPreviewAction({
        id: evaluationId,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setPreviewData(result.data);
    });
  }

  function openResults(invite: ProtocolInviteDTO, evaluationId: string) {
    setPreviewItems(invite.items);
    setPreviewOpen(true);
    loadEvaluation(evaluationId);
  }

  function confirmRevoke() {
    if (!revokeId) return;
    const id = revokeId;
    setRevokeId(null);
    startListTransition(async () => {
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

  function remove(id: string) {
    startListTransition(async () => {
      const result = await deleteProtocolInviteAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      onChange(invites.filter((invite) => invite.id !== id));
      toast.success("Link excluído");
    });
  }

  if (invites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ainda não há links públicos para este paciente.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          O responsável preenche sem login; o link expira em 30 dias.
        </p>
        {canCreate && onCreate ? (
          <Button
            type="button"
            size="sm"
            className="mt-4 w-full sm:w-auto"
            onClick={onCreate}
          >
            Novo link
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="toolbar"
        aria-label="Filtrar links"
        className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map((item) => {
          const selected = filter === item.id;
          const count = counts[item.id];
          return (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setFilterAndReset(item.id)}
            >
              {item.label} · {count}
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum link neste filtro.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => setFilterAndReset("all")}
          >
            Ver todos
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {pageItems.map((invite) => {
            const meta = statusMeta(invite);
            const StatusIcon = meta.Icon;
            const submittedItems = invite.items.filter(
              (i) => i.status === "submitted" && i.evaluationId != null,
            );
            const lastSubmittedAt = submittedItems
              .map((i) => i.submittedAt)
              .filter(Boolean)
              .sort()
              .at(-1);
            const canDelete =
              canManage && inviteListBucket(invite) === "inactive";
            const title = inviteInstrumentTitle(invite);

            return (
              <li
                key={invite.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card px-3 py-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted",
                      meta.iconClass,
                    )}
                    aria-hidden
                  >
                    <StatusIcon className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-snug">
                        {title}
                      </p>
                      <Badge className={meta.badgeClass}>{meta.label}</Badge>
                    </div>
                    {invite.items.length > 2 ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {invite.items.map((i) => i.protocolName).join(" · ")}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      <span className="sm:hidden">
                        {formatInviteDateTime(invite.createdAt)}
                        {lastSubmittedAt
                          ? ` · Resp. ${formatInviteDateTime(lastSubmittedAt)}`
                          : null}
                      </span>
                      <span className="hidden sm:inline">
                        Enviado em {formatInviteDateTime(invite.createdAt)}
                        {lastSubmittedAt
                          ? ` · Respondido em ${formatInviteDateTime(lastSubmittedAt)}`
                          : null}
                      </span>
                    </p>
                    {!invite.allSubmitted && invite.isActive ? (
                      <p className="text-xs text-muted-foreground">
                        {
                          invite.items.filter((i) => i.status === "submitted")
                            .length
                        }
                        /{invite.items.length} instrumentos
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center sm:justify-end sm:gap-1">
                  {invite.isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => copy(invite.publicUrl)}
                    >
                      <Copy data-icon="inline-start" />
                      Copiar
                    </Button>
                  ) : null}

                  {submittedItems.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openResults(invite, submittedItems[0]!.evaluationId!)
                      }
                    >
                      <List data-icon="inline-start" />
                      <span className="sm:hidden">Respostas</span>
                      <span className="hidden sm:inline">Ver respostas</span>
                    </Button>
                  ) : null}

                  {canManage && invite.isActive ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={listPending}
                      onClick={() => setRevokeId(invite.id)}
                    >
                      <Ban data-icon="inline-start" />
                      Revogar
                    </Button>
                  ) : null}

                  {canDelete ? (
                    <DeleteConfirmDialog
                      onConfirm={() => remove(invite.id)}
                      disabled={listPending}
                    >
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Excluir link"
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </DeleteConfirmDialog>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={safePage <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {safePage + 1} de {pageCount}
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label="Próxima página"
          >
            <ChevronRight />
          </Button>
        </div>
      ) : null}

      <AlertDialog
        open={revokeId != null}
        onOpenChange={(next) => {
          if (!next) setRevokeId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar este link?</AlertDialogTitle>
            <AlertDialogDescription>
              O responsável deixa de conseguir preencher. Instrumentos já
              enviados mantêm-se no prontuário de avaliações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevoke}>
              Revogar link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProtocolInviteResultsDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        items={previewItems}
        activeEvaluationId={previewEvalId}
        onSelectEvaluationId={loadEvaluation}
        preview={previewData}
        loading={previewPending}
        canUseAi={canUseAi}
        onInterpretationAISaved={(evaluationId, interpretationAI) => {
          setPreviewData((prev) =>
            prev && prev.id === evaluationId
              ? {
                  ...prev,
                  interpretationAI,
                  interpretationAIUpdatedAt: interpretationAI
                    ? new Date().toISOString()
                    : null,
                }
              : prev,
          );
        }}
      />
    </div>
  );
}
