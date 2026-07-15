import { paths } from "@/shared/constants/paths";
import {
  IconCalendar,
  IconCash,
  IconLayoutDashboard,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconChartBar,
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
      name: "Relatórios",
      url: paths.relatorio,
      icon: IconReport,
    },
    {
      name: "GMFM-88",
      url: paths.protocolosGmfm,
      icon: IconChartBar,
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
