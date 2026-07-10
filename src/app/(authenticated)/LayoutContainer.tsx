import { AppSidebar } from "@/components/templates/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/server/auth/users";
import { getOrganizations } from "@/server/organizations/organizations";

export default async function LayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();
  const organizations = await getOrganizations();

  const sidebarUser = {
    name: user.name ?? "Usuário",
    email: user.email ?? "",
    avatar: user.image ?? "/logo_dark.png",
  };

  return (
    <SidebarProvider>
      <AppSidebar
        user={sidebarUser}
        organizations={organizations.map((o) => ({
          id: o.id,
          name: o.name,
        }))}
        variant="inset"
      />
      <SidebarInset>
        <div className="flex flex-col flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
