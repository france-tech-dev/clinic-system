"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconBuildingHospital,
  IconCheck,
  IconPlus,
  IconSelector,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/shared/lib/auth-client";
import { paths } from "@/shared/constants/paths";

type OrganizationOption = {
  id: string;
  name: string;
};

type OrganizationSwitcherProps = {
  organizations: OrganizationOption[];
  activeOrganizationId: string | null;
};

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const selectedId = activeOrganizationId ?? organizations[0]?.id ?? "";
  const activeOrganization =
    organizations.find((organization) => organization.id === selectedId) ??
    organizations[0];

  const handleChangeOrganization = async (organizationId: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationId,
      });
      if (error) {
        toast.error(error.message || "Erro ao alterar clínica");
        return;
      }
      router.refresh();
      toast.success("Clínica alterada");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao alterar clínica");
    }
  };

  if (organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href={paths.organizacao}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconPlus />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Criar clínica</span>
                <span className="text-muted-foreground truncate text-xs">
                  Nova organização
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Trocar clínica"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrganization?.name ?? "Selecionar clínica"}
                </span>
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Clínicas
            </DropdownMenuLabel>
            {organizations.map((organization) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => {
                  if (organization.id !== selectedId) {
                    void handleChangeOrganization(organization.id);
                  }
                }}
              >
                <IconBuildingHospital />
                {organization.name}
                {organization.id === selectedId ? (
                  <IconCheck className="ml-auto" />
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={paths.organizacao}>
                <IconPlus />
                Nova clínica
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
