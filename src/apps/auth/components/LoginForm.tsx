import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";

import { TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { getTypeSenseClient } from "apps/common/utils/typesense";
import { validationPatterns } from "apps/common/utils/validationPatterns";
import { TypeSenseConnection } from "apps/auth/models";
import { AuthUtils } from "apps/auth/utils";
import { errorConfig, successConfig } from "apps/common/utils/snackConfigs";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const validate = async (connectionValues: TypeSenseConnection) => {
    setLoading(true);
    try {
      const client = getTypeSenseClient(connectionValues);
      try {
        const response = await client.collections().retrieve();
        if (response.length >= 0) {
          // Store the value in local storage
          AuthUtils.persistAuth(connectionValues);
          // Redirect here
          enqueueSnackbar(
            "Successfully authenticated with TypeSense",
            successConfig
          );
          navigate("/index/list");
        }
      } catch (err) {
        // Display a snack
        enqueueSnackbar("Could not connect to TypeSense", errorConfig);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TypeSenseConnection>({
    defaultValues: {
      host: "localhost",
      port: 8108,
      protocol: "http",
      apiKey: "",
    },
  });

  return (
    <form>
      <Controller
        name="host"
        control={control}
        rules={{
          required: "Host is required",
          pattern: validationPatterns.host,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="host"
            label="Host"
            error={!!errors.host}
            helperText={errors.host && "Please enter a valid host"}
          />
        )}
      />
      <Controller
        name="port"
        control={control}
        rules={{
          required: "Port is required",
          pattern: validationPatterns.port,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="port"
            label="Port"
            error={!!errors.port}
            helperText={errors.port && "Please enter a valid port"}
          />
        )}
      />
      <Controller
        name="protocol"
        control={control}
        rules={{
          required: "protocol is required",
          pattern: validationPatterns.protocol,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="protocol"
            label="protocol"
            error={!!errors.protocol}
            helperText={errors.protocol && "Please enter a valid protocol"}
          />
        )}
      />
      <Controller
        name="apiKey"
        control={control}
        rules={{
          required: "apiKey is required",
        }}
        render={({ field }) => (
          <TextField
            {...field}
            id="apiKey"
            error={!!errors.apiKey}
            helperText={errors.apiKey && "Please enter a valid apiKey"}
            margin="normal"
            required
            fullWidth
            name="apiKey"
            label="Api Key"
            type="password"
            autoComplete="current-password"
          />
        )}
      />
      <LoadingButton
        fullWidth
        loading={loading}
        variant="contained"
        sx={{ mt: 3, mb: 2, borderRadius: 2 }}
        onClick={handleSubmit(validate)}
      >
        Login
      </LoadingButton>
    </form>
  );
};
