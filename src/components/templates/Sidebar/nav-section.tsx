"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarSection } from "@/resources/sidebar-items";
import Link from "next/link";

interface NavSectionProps {
  items: SidebarSection["items"];
  title: string;
}

export function NavSection({ items, title }: NavSectionProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link
                href={item.url}
                prefetch={true}
                className="flex items-center gap-2 my-2 bg-red-200"
              >
                <item.icon />
                <span className="text-sm bg-red-300">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
