import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import Provider from "./providers/Provider";
import { cn } from "@/shared/lib/utils";
import { BRAND_LOGO } from "@/shared/constants/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movi Clínicas",
  description:
    "Sistema de gestão clínica e agendamentos para profissionais da saúde",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: BRAND_LOGO, type: "image/png" }],
    apple: BRAND_LOGO,
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <TooltipProvider>{children}</TooltipProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
