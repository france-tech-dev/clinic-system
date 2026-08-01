import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "sonner";
import ThemeSwitcher from "@/components/templates/ThemeSwitcher/ThemeSwitcher";
import Provider from "./providers/Provider";
import { cn } from "@/shared/lib/utils";

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
  title: "Movi Clinicas",
  description:
    "Sistema de gestão clínica e agendamentos para profissionais da saúde",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
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
          <TooltipProvider>
            <div className="fixed bottom-3 right-3 z-50">
              <ThemeSwitcher />
            </div>
            {children}
          </TooltipProvider>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
