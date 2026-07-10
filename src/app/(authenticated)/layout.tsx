import LayoutContainer from "./LayoutContainer";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutContainer>{children}</LayoutContainer>;
}
