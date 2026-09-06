"use client";

import { NavMain } from "@/components/templates/Sidebar/nav-main";
import { NavUser } from "@/components/templates/Sidebar/nav-user";
import { OrganizationSwitcher } from "@/components/auth/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { sidebarItems, type SidebarUser } from "@/resources/sidebar-items";
import { ThemeLogo } from "../ThemeSwitcher/theme-logo";
import { User } from "lucide-react";

const defaultUser: SidebarUser = {
  name: "Usuário",
  email: "",
  avatar: <User />,
  role: null,
};

export function AppSidebar({
  user,
  organizations = [],
  activeOrganizationId = null,
  isPlatformAdmin = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser | null;
  organizations?: { id: string; name: string }[];
  activeOrganizationId?: string | null;
  isPlatformAdmin?: boolean;
}) {
  const sidebarUser = user ?? defaultUser;
  const items = sidebarItems.filter((item) => {
    if (item.platformAdminOnly) return isPlatformAdmin;
    return (
      !item.canAccess?.length ||
      (sidebarUser.role != null && item.canAccess.includes(sidebarUser.role))
    );
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 overflow-hidden px-2 py-2 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <ThemeLogo />
          <span className="truncate font-serif text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Movi Clinicas
          </span>
        </div>
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
