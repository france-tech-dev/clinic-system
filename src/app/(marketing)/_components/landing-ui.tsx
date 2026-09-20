import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";

export const landingDisplay =
  "font-[family-name:var(--font-marketing-display)] font-semibold tracking-[-0.01em] text-[var(--movi-heading)]";

export const landingContainer =
  "mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-10";

export const landingSectionScroll = "scroll-mt-20 md:scroll-mt-28";

const btnBase =
  "inline-flex h-[54px] items-center justify-center rounded-full px-[30px] text-[17px] font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--movi-action)]";

export function LandingBtnGreen({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        btnBase,
        "bg-[var(--movi-action)] text-[var(--movi-action-fg)] hover:bg-[var(--movi-action-hover)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingBtnSun({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        btnBase,
        "bg-[var(--movi-sun)] text-[var(--movi-ink)] hover:bg-[var(--movi-sun-hover)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingBtnLine({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        btnBase,
        "border-2 border-[var(--movi-heading)] bg-transparent text-[var(--movi-heading)] hover:bg-[var(--movi-action)] hover:text-[var(--movi-action-fg)] hover:border-[var(--movi-action)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingTextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-extrabold text-[var(--movi-heading)] underline decoration-2 underline-offset-[5px] hover:text-[var(--movi-green-deep)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--movi-action)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function LandingTrialCta({ className }: { className?: string }) {
  return (
    <LandingBtnGreen href={paths.auth.signup} className={className}>
      Testar {TRIAL_DAYS} dias grátis
    </LandingBtnGreen>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="var(--movi-heading)"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
