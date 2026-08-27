"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  Info,
  Lock,
  UserRound,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  protocolAbbrev,
  protocolSubtitle,
} from "@/domains/protocol/invite/_lib/protocol-labels";
import type { PublicProtocolInviteDTO } from "@/domains/protocol/invite/protocol-invite.types";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { PublicInviteShell } from "./public-invite-shell";

function protocolTone(protocolId: string): string {
  if (protocolId.startsWith("spm")) {
    return "bg-emerald-600/15 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300";
  }
  if (protocolId.startsWith("perfil-sensorial")) {
    return "bg-sky-600/15 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300";
  }
  return "bg-primary/15 text-foreground dark:bg-primary/20";
}

export function InviteHub({ invite }: { invite: PublicProtocolInviteDTO }) {
  const submitted = invite.items.filter((i) => i.status === "submitted").length;
  const total = invite.items.length;
  const remaining = Math.max(0, total - submitted);
  const progressValue = total === 0 ? 0 : (submitted / total) * 100;

  return (
    <PublicInviteShell clinicName={invite.clinicName}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-5 p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Olá! Responda as avaliações abaixo
            </h2>
            <p className="text-sm text-muted-foreground">
              Toque numa avaliação para começar. Em cada uma, responda todas as
              questões e envie no final.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                aria-hidden
              >
                {invite.patientInitials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Nome da criança
                </p>
                <p className="truncate font-medium">{invite.patientFirstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-hidden
              >
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Nome do terapeuta
                </p>
                <p className="truncate font-medium">
                  {invite.therapistName ?? invite.clinicName}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium tabular-nums">
                {submitted} / {total} concluídas
              </span>
              <span className="text-muted-foreground">
                {remaining === 0
                  ? "Tudo pronto"
                  : `Faltam ${remaining}`}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {invite.allSubmitted ? (
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-5 text-center">
              <Check className="mx-auto mb-2 size-7 text-primary" />
              <p className="font-medium">Todas as avaliações foram enviadas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Obrigado. O profissional já pode consultar as respostas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Avaliações
                </p>
                <p className="text-xs text-muted-foreground">
                  Toque para responder
                </p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {invite.items.map((item) => {
                  const href = paths.avaliacaoPublica.byProtocol(
                    invite.token,
                    item.protocolId,
                  );
                  const done = item.status === "submitted";
                  const subtitle = protocolSubtitle(
                    item.protocolId,
                    item.protocolName,
                  );

                  return (
                    <li key={item.id}>
                      {done ? (
                        <div className="flex items-center gap-3 bg-muted/30 px-3 py-3.5 sm:px-4">
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              protocolTone(item.protocolId),
                            )}
                          >
                            {protocolAbbrev(item.protocolId)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {item.protocolName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Concluída
                            </p>
                          </div>
                          <Check className="size-5 shrink-0 text-primary" />
                        </div>
                      ) : (
                        <Link
                          href={href}
                          className="flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-muted/40 sm:px-4"
                        >
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              protocolTone(item.protocolId),
                            )}
                          >
                            {protocolAbbrev(item.protocolId)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {item.protocolName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subtitle ?? `${item.totalCount} questões`}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary">
                            Responder
                            <ChevronRight className="size-4" />
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {!invite.allSubmitted ? (
          <div className="flex items-start gap-2 border-t border-border bg-primary/10 px-4 py-3 text-sm text-foreground sm:px-6">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p>
              Em cada avaliação, use{" "}
              <span className="font-medium">Enviar respostas</span> no final.
              Só depois disso o terapeuta passa a ver esse instrumento.
            </p>
          </div>
        ) : null}
      </div>

      <footer className="grid gap-2 px-1 pb-4 text-xs text-muted-foreground">
        <p className="flex items-start gap-2">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Link confidencial. Se sair a meio de uma avaliação sem enviar, as
            respostas dessa página não são guardadas.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Este link é válido enquanto estiver activo. Depois de começar uma
            avaliação, pode concluí-la com calma.
          </span>
        </p>
      </footer>
    </PublicInviteShell>
  );
}
