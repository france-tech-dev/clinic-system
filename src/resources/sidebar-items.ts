import { paths } from "@/shared/constants/paths";
import {
  IconBrandWhatsapp,
  IconChartBar,
  IconDashboard,
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
      name: "Dashboard",
      url: paths.root,
      icon: IconDashboard,
    },
    {
      name: "Cadastro UniAG",
      url: paths.enrollmentLeads,
      icon: IconUserPlus,
    },
    {
      name: "WhatsApp",
      url: paths.whatsapp,
      icon: IconBrandWhatsapp,
    },
    {
      name: "Relatórios",
      url: paths.reports,
      icon: IconChartBar,
    },
  ],
  sections: [] as SidebarSection[],
};
