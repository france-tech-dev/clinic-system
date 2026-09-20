import type { ReactNode } from "react";
import { Fredoka, Nunito } from "next/font/google";
import { cn } from "@/shared/lib/utils";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-marketing-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-marketing-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        fredoka.variable,
        nunito.variable,
        "marketing-landing min-h-dvh antialiased",
        "bg-[var(--movi-cream)] text-[var(--movi-ink)]",
        "font-[family-name:var(--font-marketing-sans)]",
      )}
    >
      {children}
    </div>
  );
}
