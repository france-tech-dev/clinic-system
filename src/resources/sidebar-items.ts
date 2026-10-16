import { paths } from "@/shared/constants/paths";
import type { ClinicResource } from "@/shared/lib/permissions";
import {
  IconCalendar,
  IconCash,
  IconClipboardList,
  IconFileText,
  IconLayoutDashboard,
  IconShield,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

export type SidebarItem = {
  name: string;
  url: string;
  icon: React.ElementType;
  /** Recurso clínico exigido (read). Sem isto = qualquer papel de painel. */
  requires?: ClinicResource;
  platformAdminOnly?: boolean;
};

export type SidebarUser = {
  name: string;
  email: string;
  avatar: string | React.ReactNode;
  role: string | null;
};

export type SidebarModuleAccess = Partial<Record<ClinicResource, boolean>>;

export const sidebarItems: SidebarItem[] = [
  {
    name: "Plataforma",
    url: paths.plataforma,
    icon: IconShield,
    platformAdminOnly: true,
  },
  {
    name: "Dashboard",
    url: paths.dashboard,
    icon: IconLayoutDashboard,
    requires: "finance",
  },
  {
    name: "Agenda",
    url: paths.agenda,
    icon: IconCalendar,
  },
  {
    name: "Caixa",
    url: paths.caixa,
    icon: IconCash,
    requires: "finance",
  },
  {
    name: "Pacientes",
    url: paths.pacientes,
    icon: IconUsers,
  },
  {
    name: "Profissionais",
    url: paths.profissionais,
    icon: IconUserPlus,
    requires: "team",
  },
  {
    name: "Avaliações",
    url: paths.avaliacoes.root,
    icon: IconClipboardList,
  },
  {
    name: "Anamnese",
    url: paths.anamnese.root,
    icon: IconFileText,
  },
];
