"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Item {
  name: string;
  url: string;
  icon: React.ElementType;
}

function isNavActive(pathname: string, url: string) {
  if (pathname === url) return true;
  return pathname.startsWith(`${url}/`);
}

export function NavMain({ items }: { items: Item[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const active = isNavActive(pathname, item.url);
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  tooltip={item.name}
                  className="h-[unset]"
                  isActive={active}
                  asChild
                >
                  <Link
                    href={item.url}
                    prefetch={true}
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    {item.icon ? (
                      <span
                        className={cn(
                          "rounded-full p-2 text-xl",
                          active
                            ? "bg-secondary text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        <item.icon />
                      </span>
                    ) : null}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
