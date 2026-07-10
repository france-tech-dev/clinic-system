import { paths } from "@/shared/constants/paths";
import {
  IconBooks,
  IconCalendar,
  IconLayoutDashboard,
  IconNotebook,
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
      name: "Pacientes",
      url: paths.pacientes,
      icon: IconUsers,
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
