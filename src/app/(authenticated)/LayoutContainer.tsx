import { AppSidebar } from "@/components/templates/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/server/auth/users";
import { getOrganizations } from "@/server/organizations/organizations";

export default async function LayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await getCurrentUser();
  const organizations = await getOrganizations();
  const activeOrganizationId = session.activeOrganizationId ?? null;

  const sidebarUser = {
    name: user.name ?? "Usuário",
    email: user.email ?? "",
    avatar: user.image ?? "/logo_dark.png",
  };

  return (
    <SidebarProvider className="h-svh! min-h-0 overflow-hidden">
      <AppSidebar
        user={sidebarUser}
        organizations={organizations.map((o) => ({
          id: o.id,
          name: o.name,
        }))}
        activeOrganizationId={activeOrganizationId}
        variant="inset"
      />
      <SidebarInset className="min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
