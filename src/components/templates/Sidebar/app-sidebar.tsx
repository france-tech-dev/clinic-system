"use client";

import { NavMain } from "@/components/templates/Sidebar/nav-main";
import { NavSection } from "@/components/templates/Sidebar/nav-section";
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

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center px-4 py-2">
            <ThemeLogo />
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pb-2">
          <OrganizationSwitcher
            organizations={organizations}
            activeOrganizationId={activeOrganizationId}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={sidebarItems.navMain} />
        {sidebarItems.sections.map((section) => (
          <NavSection
            key={section.name}
            title={section.name}
            items={section.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
