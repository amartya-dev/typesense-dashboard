import { Button } from "@mui/material";
import { OptionsObject, SnackbarKey, closeSnackbar } from "notistack";

export const successConfig: OptionsObject = {
  autoHideDuration: 3000,
  variant: "success",
};

const action = (snackbarId: SnackbarKey | undefined) => (
  <Button
    onClick={() => {
      closeSnackbar(snackbarId);
    }}
    variant="text"
    sx={{
      color: "white",
    }}
  >
    Dismiss
  </Button>
);

export const errorConfig: OptionsObject = {
  persist: true,
  variant: "error",
  action,
};
