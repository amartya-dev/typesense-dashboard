import React from "react";
import {
  Box,
  Divider,
  Drawer,
  List,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SidebarConfig } from "apps/common/utils/SidebarConfig";
import { SidebarItem } from "./SidebarItem";

interface DashboardSideBarProps {
  open: boolean;
}

const drawerWidth = 240;

export const DashboardSideBar = ({ open }: DashboardSideBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
      open={open}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {SidebarConfig.map((sidebarItem) => {
            return (
              <React.Fragment key={sidebarItem.label}>
                <SidebarItem
                  icon={sidebarItem.icon}
                  label={sidebarItem.label}
                  children={sidebarItem.children}
                  link={sidebarItem.link}
                  basePath={sidebarItem.basePath}
                />
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};
