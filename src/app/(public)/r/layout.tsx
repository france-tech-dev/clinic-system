import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avaliação",
  robots: { index: false, follow: false },
};

export default function PublicAvaliacaoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
