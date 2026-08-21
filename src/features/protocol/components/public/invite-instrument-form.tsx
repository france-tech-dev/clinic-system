"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { submitPublicInviteAction } from "@/features/protocol/invite/protocol-invite.public.actions";
import type { PublicProtocolInviteInstrumentDTO } from "@/features/protocol/invite/protocol-invite.types";
import {
  parseItemProtocolResponses,
  type ItemProtocolTemplate,
} from "@/features/protocol/evaluation-modules/_shared/item-protocol-template";
import {
  ITEM_SCALE_OPTIONS,
  type ItemResponseValue,
} from "@/features/protocol/evaluation-modules/_shared/item-scale";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { PublicInviteShell } from "./public-invite-shell";

function shortLabel(value: ItemResponseValue): string {
  return String(value);
}

export function InviteInstrumentForm({
  instrument,
  template,
}: {
  instrument: PublicProtocolInviteInstrumentDTO;
  template: ItemProtocolTemplate;
}) {
  const router = useRouter();
  const [responses, setResponses] = useState(() =>
    parseItemProtocolResponses(template, instrument.responses),
  );
  const [pending, startTransition] = useTransition();

  const scaleOptions = ITEM_SCALE_OPTIONS[template.scale];
  const readOnly = instrument.status === "submitted";

  const progress = useMemo(() => {
    const ids = template.sections.flatMap((s) => s.items.map((i) => i.id));
    const answered = ids.filter((id) => responses[id] != null).length;
    return { answered, total: ids.length };
  }, [responses, template]);

  const progressValue =
    progress.total === 0 ? 0 : (progress.answered / progress.total) * 100;

  function setAnswer(itemId: string, value: ItemResponseValue) {
    if (readOnly) return;
    setResponses((prev) => ({ ...prev, [itemId]: value }));
  }

  function onSubmit() {
    startTransition(async () => {
      const result = await submitPublicInviteAction({
        token: instrument.token,
        protocolId: instrument.protocolId,
        responses,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        result.data.alreadySubmitted
          ? "Avaliação já tinha sido enviada"
          : "Avaliação enviada",
      );
      router.push(paths.avaliacaoPublica.byToken(instrument.token));
      router.refresh();
    });
  }

  function sectionAnswered(sectionId: string) {
    const section = template.sections.find((s) => s.id === sectionId);
    if (!section) return 0;
    return section.items.filter((item) => responses[item.id] != null).length;
  }

  const itemNumbers = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const section of template.sections) {
      for (const item of section.items) {
        n += 1;
        map.set(item.id, n);
      }
    }
    return map;
  }, [template]);

  return (
    <PublicInviteShell clinicName={instrument.clinicName}>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
      >
        <Link href={paths.avaliacaoPublica.byToken(instrument.token)}>
          <ArrowLeft data-icon="inline-start" />
          Voltar ao menu
        </Link>
      </Button>

      <div className="space-y-2 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm sm:px-6">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Avaliação
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-primary">
          {instrument.protocolName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Preenchimento referente a{" "}
          <span className="font-medium text-foreground">
            {instrument.patientFirstName}
          </span>
          . Responda todas as questões e toque em{" "}
          <span className="font-medium text-foreground">Enviar respostas</span>{" "}
          no final para o terapeuta receber esta avaliação.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm sm:px-6">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium tabular-nums">
            {progress.answered} / {progress.total} questões respondidas
          </span>
          {readOnly ? (
            <span className="inline-flex items-center gap-1 text-primary">
              <Check className="size-4" />
              Enviada
            </span>
          ) : null}
        </div>
        <Progress value={progressValue} className="h-2.5" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-amber-500/10 px-4 py-3 text-sm text-amber-950 shadow-sm dark:bg-amber-400/10 dark:text-amber-100 sm:px-5">
        {scaleOptions.map((opt) => (
          <span
            key={String(opt.value)}
            className="inline-flex items-center gap-1.5"
          >
            <span className="flex size-6 items-center justify-center rounded-full border border-amber-900/20 bg-card text-xs font-semibold dark:border-amber-100/20">
              {shortLabel(opt.value)}
            </span>
            {opt.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {template.sections.map((section) => {
          const answered = sectionAnswered(section.id);
          return (
            <section
              key={section.id}
              className="scroll-mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 bg-muted/60 px-4 py-3 sm:px-5">
                <h3 className="text-sm font-semibold tracking-tight uppercase">
                  {section.id.toUpperCase()}: {section.title}
                </h3>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {answered} de {section.items.length} respondidas
                </span>
              </div>
              <ul className="divide-y divide-border">
                {section.items.map((item) => {
                  const value = responses[item.id];
                  const stringValue =
                    value === null || value === undefined ? "" : String(value);
                  return (
                    <li
                      key={item.id}
                      className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                    >
                      <p className="min-w-0 flex-1 text-sm leading-snug">
                        <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">
                          {itemNumbers.get(item.id)}.
                        </span>
                        {item.label}
                      </p>
                      <div
                        className="flex shrink-0 flex-wrap gap-2"
                        role="group"
                        aria-label={item.label}
                      >
                        {scaleOptions.map((opt) => {
                          const selected = stringValue === String(opt.value);
                          return (
                            <button
                              key={String(opt.value)}
                              type="button"
                              disabled={readOnly || pending}
                              aria-pressed={selected}
                              title={opt.label}
                              onClick={() => setAnswer(item.id, opt.value)}
                              className={cn(
                                "flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                                (readOnly || pending) &&
                                  "cursor-default opacity-80",
                              )}
                            >
                              {shortLabel(opt.value)}
                            </button>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-card sm:px-6 sm:py-4 sm:shadow-sm sm:backdrop-blur-none">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(paths.avaliacaoPublica.byToken(instrument.token))
            }
            disabled={pending}
          >
            Voltar
          </Button>
          {!readOnly ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={pending || progress.answered < progress.total}
            >
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Enviar respostas
            </Button>
          ) : null}
        </div>
      </div>
    </PublicInviteShell>
  );
}
