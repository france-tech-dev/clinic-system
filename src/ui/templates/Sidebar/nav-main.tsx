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
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const active = isNavActive(pathname, item.url);
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  tooltip={item.name}
                  size="lg"
                  className="h-10 gap-2.5 px-2"
                  isActive={active}
                  asChild
                >
                  <Link
                    href={item.url}
                    prefetch={true}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    {item.icon ? (
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
                          active
                            ? "bg-secondary text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        <item.icon />
                      </span>
                    ) : null}
                    <span className="text-sm group-data-[collapsible=icon]:hidden">
                      {item.name}
                    </span>
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
