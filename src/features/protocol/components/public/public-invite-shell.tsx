"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import ThemeSwitcher from "@/components/templates/ThemeSwitcher/ThemeSwitcher";
import { cn } from "@/shared/lib/utils";

export function PublicInviteShell({
  children,
  clinicName,
  className,
}: {
  children: ReactNode;
  clinicName?: string;
  className?: string;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-5 sm:py-8",
          className,
        )}
      >
        <header className="overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-medium tracking-[0.14em] text-primary-foreground/75 uppercase">
                Avaliações clínicas
              </p>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {clinicName ?? "Preenchimento pelo responsável"}
              </h1>
              {clinicName ? (
                <p className="truncate text-sm text-primary-foreground/80">
                  Preenchimento pelo responsável
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="hidden items-center gap-1.5 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-xs text-primary-foreground/90 sm:inline-flex">
                <Lock className="size-3.5" aria-hidden />
                Link seguro
              </span>
              <div className="[&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/10 [&_button]:hover:text-primary-foreground">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
