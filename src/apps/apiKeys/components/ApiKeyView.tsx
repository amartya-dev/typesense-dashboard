import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { successConfig } from "apps/common/utils/snackConfigs";
import { enqueueSnackbar } from "notistack";
import React from "react";

interface APIKeyViewModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiKey: string;
}

export const APIKeyViewModal = ({
  open,
  setOpen,
  apiKey,
}: APIKeyViewModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle>Your API Key</DialogTitle>
      <DialogContent>
        <TextField
          disabled
          value={apiKey}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    enqueueSnackbar("Copied API Key", successConfig);
                  }}
                >
                  <Icon icon="ph:copy" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
