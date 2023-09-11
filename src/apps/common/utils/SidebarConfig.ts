import { SidebarItemProps } from "../components/SidebarItem";

export const SidebarConfig: SidebarItemProps[] = [
  {
    label: "Index",
    icon: "material-symbols:settings-outline",
    basePath: "/index",
    children: [
      {
        label: "Indices",
        icon: "solar:document-linear",
        link: "/index/list",
      },
      {
        label: "Add Index",
        icon: "material-symbols:add",
        link: "/index/add",
      },
      {
        label: "Documents",
        icon: "solar:documents-bold-duotone",
        link: "/index/documents",
      },
    ],
  },
  {
    label: "Observe",
    icon: "material-symbols:analytics",
    basePath: "/observe",
    children: [
      {
        label: "Analytics Rules",
        icon: "grommet-icons:analytics",
        link: "/observe/rules",
      },
      {
        label: "Reports",
        icon: "tdesign:chart-analytics",
        link: "/observe/reports",
      },
    ],
  },
  {
    label: "Api Keys",
    icon: "",
    basePath: "/keys",
    children: [
      {
        label: "Add Api Key",
        icon: "",
        link: "/keys/add",
      },
    ],
  },
];
