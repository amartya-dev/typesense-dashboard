import { Icon } from "@iconify/react";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

interface SidebarItemBase {
  label: string;
  icon: string;
  link?: string;
}

export interface SidebarItemProps extends SidebarItemBase {
  children?: SidebarItemBase[];
  basePath: string;
}

export const SidebarItem = ({
  label,
  icon,
  link,
  children,
  basePath,
}: SidebarItemProps) => {
  const theme = useTheme();
  const location = useLocation();
  const [expanded, setExpanded] = useState<boolean>(
    location.pathname.match(basePath.concat("/*")) !== null
  );
  const navigate = useNavigate();

  return (
    <>
      <ListItemButton
        onClick={() => {
          if (children) {
            setExpanded(!expanded);
            return;
          }
          link && navigate(link);
        }}
      >
        <ListItemIcon>
          <Icon fontSize={20} icon={icon} />
        </ListItemIcon>
        <ListItemText primary={label} />
        {children &&
          (expanded ? (
            <Icon icon="ooui:collapse" />
          ) : (
            <Icon icon="ooui:expand" />
          ))}
      </ListItemButton>
      {children && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((child) => {
              const matches = matchPath(location.pathname, child.link || "");
              return (
                <ListItemButton
                  key={child.label}
                  sx={{
                    pl: 4,
                    ...(matches && {
                      backgroundColor: theme.palette.secondary.main,
                    }),
                  }}
                  onClick={() => {
                    child.link && navigate(child.link);
                  }}
                >
                  <ListItemIcon>
                    <Icon fontSize={20} icon={child.icon} />
                  </ListItemIcon>
                  <ListItemText primary={child.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
};
