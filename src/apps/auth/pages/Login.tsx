import { Card, Box, Typography } from "@mui/material";
import { LoginForm } from "apps/auth/components/LoginForm";

export const Login = () => {
  return (
    <Box
      pt={8}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        backgroundColor: "#4158D0",
        backgroundImage: "linear-gradient(43deg, #4158D0, #C850C0, #FFCC70)",
        height: "100vh",
      }}
    >
      <Card
        sx={{ width: "30%", marginTop: "5%", padding: "2%", borderRadius: 5 }}
        elevation={2}
      >
        <Typography component="h1" variant="h5" textAlign="center">
          Login
        </Typography>
        <LoginForm />
      </Card>
    </Box>
  );
};
