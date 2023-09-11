import {
  AppBar,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { DashboardSideBar } from "../components/DashboardSideBar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;
const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up("md")]: {
    paddingTop: APP_BAR_DESKTOP + 10,
    paddingLeft: 280,
    paddingRight: theme.spacing(2),
  },
}));

export const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile ? (
            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <Icon
                  icon="material-symbols:menu"
                  fontSize={24}
                  color="white"
                />
              </IconButton>
              <Typography pt={0.3} variant="h6" noWrap component="div">
                TypeSense dashboard
              </Typography>
            </Stack>
          ) : (
            <Typography variant="h6" noWrap component="div">
              TypeSense dashboard
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <DashboardSideBar open={open} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </>
  );
};
