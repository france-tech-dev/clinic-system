import { paths } from "@/shared/constants/paths";
import { LEADERSHIP_ROLES } from "@/shared/lib/member-role";
import {
  IconCalendar,
  IconCash,
  IconClipboardList,
  IconCreditCard,
  IconFileText,
  IconLayoutDashboard,
  IconSearch,
  IconSettings,
  IconShield,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { Role } from "../../prisma/generated/prisma/enums";

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
    name: "Painel",
    url: paths.painel,
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
  {
    name: "Buscar",
    url: paths.buscar,
    icon: IconSearch,
  },
  {
    name: "Planos",
    url: paths.planos,
    icon: IconCreditCard,
    canAccess: LEADERSHIP_ROLES,
  },
  {
    name: "Configurações",
    url: paths.configuracoes,
    icon: IconSettings,
    canAccess: LEADERSHIP_ROLES,
  },
];
