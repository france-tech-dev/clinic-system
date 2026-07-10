"use client";

import { NavMain } from "@/components/templates/Sidebar/nav-main";
import { NavSection } from "@/components/templates/Sidebar/nav-section";
import { NavUser } from "@/components/templates/Sidebar/nav-user";
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
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: SidebarUser | null }) {
  const sidebarUser = user ?? defaultUser;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full px-15 mb-[-20px]">
            <ThemeLogo
              width={200}
              height={200}
              className="w-full object-cover"
            />
          </SidebarMenuItem>
        </SidebarMenu>
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
