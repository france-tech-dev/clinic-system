import { paths } from "@/shared/constants/paths";
import {
  IconCalendar,
  IconCash,
  IconClipboardList,
  IconLayoutDashboard,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";

export type SidebarSection = {
  name: string;
  items: {
    name: string;
    url: string;
    icon: React.ElementType;
  }[];
};

export type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

export const sidebarItems = {
  navMain: [
    {
      name: "Painel",
      url: paths.painel,
      icon: IconLayoutDashboard,
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
    },
    {
      name: "Avaliações",
      url: paths.avaliacoes.root,
      icon: IconClipboardList,
    },
    {
      name: "Buscar",
      url: paths.buscar,
      icon: IconSearch,
    },
    {
      name: "Configurações",
      url: paths.configuracoes,
      icon: IconSettings,
    },
  ],
  sections: [] as SidebarSection[],
};
