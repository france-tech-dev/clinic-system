"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { authClient } from "@/shared/lib/auth-client";
import { paths } from "@/shared/constants/paths";

type OrganizationOption = {
  id: string;
  name: string;
};

type OrganizationSwitcherProps = {
  organizations: OrganizationOption[];
};

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  if (organizations.length === 0) {
    return (
      <Button asChild size="sm" className="w-full justify-start">
        <Link href={paths.organizacao}>
          <Plus className="size-4" />
          Criar clínica
        </Link>
      </Button>
    );
  }

  const handleChangeOrganization = async (organizationId: string) => {
    if (organizationId === "__create__") {
      router.push(paths.organizacao);
      return;
    }
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

  return (
    <div className="flex flex-col gap-1.5">
      <p className="px-1 text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
        Clínica
      </p>
      <Select
        value={activeOrganization?.id}
        onValueChange={(value) => {
          if (value) void handleChangeOrganization(value);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar clínica" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((organization) => (
            <SelectItem key={organization.id} value={organization.id}>
              {organization.name}
            </SelectItem>
          ))}
          <SelectItem value="__create__">+ Nova clínica</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
