import { paths } from "@/shared/constants/paths";
import { LEADERSHIP_ROLES } from "@/shared/lib/member-role";
import {
  IconCalendar,
  IconCash,
  IconClipboardList,
  IconFileText,
  IconLayoutDashboard,
  IconShield,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { Role } from "@prisma/enums";

export type SidebarItem = {
  name: string;
  url: string;
  icon: React.ElementType;
  canAccess?: readonly Role[];
  platformAdminOnly?: boolean;
};

export type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
  role: Role | null;
};

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
    canAccess: LEADERSHIP_ROLES,
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
    canAccess: LEADERSHIP_ROLES,
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
    canAccess: LEADERSHIP_ROLES,
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
