"use client";

import { NavMain } from "@/components/templates/Sidebar/nav-main";
import { NavUser } from "@/components/templates/Sidebar/nav-user";
import { OrganizationSwitcher } from "@/components/auth/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarItems, type SidebarUser } from "@/resources/sidebar-items";
import { ThemeLogo } from "../ThemeSwitcher/theme-logo";

const defaultUser: SidebarUser = {
  name: "Usuário",
  email: "",
  avatar: "/logo_dark.png",
  role: null,
};

export function AppSidebar({
  user,
  organizations = [],
  activeOrganizationId = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser | null;
  organizations?: { id: string; name: string }[];
  activeOrganizationId?: string | null;
}) {
  const sidebarUser = user ?? defaultUser;
  const items = sidebarItems.filter(
    (item) =>
      !item.canAccess?.length ||
      (sidebarUser.role != null && item.canAccess.includes(sidebarUser.role)),
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center px-4 py-2">
            <ThemeLogo />
          </SidebarMenuItem>
        </SidebarMenu>
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
