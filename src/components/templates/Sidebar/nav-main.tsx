"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface Item {
  name: string;
  url: string;
  icon: React.ElementType;
}

export function NavMain({ items }: { items: Item[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                tooltip={item.name}
                className={"h-[unset]"}
                asChild
              >
                <Link
                  href={item.url}
                  prefetch={true}
                  className="flex items-center gap-2 text-primary"
                >
                  {item.icon && (
                    <span className="text-xl text-primary bg-secondary p-2 rounded-full">
                      <item.icon />
                    </span>
                  )}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
