import { paths } from "@/shared/constants/paths";
import {
  IconBooks,
  IconCalendar,
  IconCash,
  IconLayoutDashboard,
  IconNotebook,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
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
      name: "Buscar",
      url: paths.buscar,
      icon: IconSearch,
    },
    {
      name: "Biblioteca",
      url: paths.biblioteca,
      icon: IconBooks,
    },
    {
      name: "Estudo",
      url: paths.estudo,
      icon: IconNotebook,
    },
    {
      name: "Configurações",
      url: paths.configuracoes,
      icon: IconSettings,
    },
  ],
  sections: [] as SidebarSection[],
};
