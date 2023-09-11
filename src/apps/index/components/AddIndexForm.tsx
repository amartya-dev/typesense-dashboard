import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { AuthUtils } from "apps/auth/utils";
import { FieldType } from "typesense/lib/Typesense/Collection";
import { useNavigate } from "react-router-dom";
import { Client } from "typesense";
import { enqueueSnackbar } from "notistack";
import { errorConfig, successConfig } from "apps/common/utils/snackConfigs";

const schemaTypes = [
  "string",
  "string[]",
  "int32",
  "int32[]",
  "int64",
  "float",
  "float[]",
  "bool",
  "bool[]",
  "geopoint",
  "geopoint[]",
  "object",
  "object[]",
  "string*",
  "auto",
];

export const AddIndexForm = () => {
  const theme = useTheme();
  interface Inputs {
    name: string;
    fields: {
      name: string;
      type: FieldType;
      facet: "false" | "true";
    }[];
  }

  const [withSchema, setWithSchema] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  let typesenseClient: Client;
  try {
    typesenseClient = getTypeSenseClient(AuthUtils.getAuthDetails());
  } catch (error) {
    navigate("/login");
  }

  const saveIndex = async (formValues: Inputs) => {
    setLoading(true);
    const parsedFields = withSchema
      ? formValues.fields
          .filter((field) => {
            return field.name !== "";
          })
          .map((field) => {
            return {
              name: field.name,
              type: field.type,
              facet: field.facet === "true",
            };
          })
      : [];
    console.log(parsedFields);
    try {
      await typesenseClient.collections().create({
        name: formValues.name,
        fields:
          parsedFields.length !== 0
            ? parsedFields
            : [
                {
                  name: ".*",
                  type: "auto",
                },
              ],
      });
      enqueueSnackbar("successfully added index", successConfig);
    } catch (err: any) {
      enqueueSnackbar(err.message, errorConfig);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (withSchema && fields.length === 0) {
      append({
        name: "",
        type: "string",
        facet: "false",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withSchema]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
      fields: [],
    },
  });
  const { fields, append, remove } = useFieldArray<Inputs>({
    control,
    name: "fields",
  });

  return (
    <Box sx={{ width: "70%" }}>
      <Controller
        name="name"
        control={control}
        rules={{}}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="indexName"
            label="Index Name"
            error={!!errors.name}
            helperText={errors.name && "Please enter valid name"}
          />
        )}
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked
            value={withSchema}
            onChange={() => {
              setWithSchema(!withSchema);
            }}
          />
        }
        label="With Schema ?"
      />
      {withSchema && (
        <>
          <Stack direction="row" spacing={2} mt={2}>
            <Typography variant="h5">Schema</Typography>
            <Button
              onClick={() => {
                append({
                  name: "",
                  type: "string",
                  facet: "false",
                });
              }}
              variant="text"
            >
              + Add Field
            </Button>
          </Stack>
          {fields.map((item, index) => {
            return (
              <Stack direction="row" spacing={2} key={item.id} sx={{ mt: 2 }}>
                <Controller
                  name={`fields.${index}.name`}
                  control={control}
                  rules={{
                    required: "Field name is required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      margin="normal"
                      fullWidth
                      id={`fields-${index}-name`}
                      label="Name"
                      error={errors.fields && !!errors.fields[index]?.name}
                      helperText={
                        errors.fields &&
                        !!errors.fields[index]?.name &&
                        "Name is required"
                      }
                    />
                  )}
                />
                <Controller
                  name={`fields.${index}.type`}
                  control={control}
                  rules={{}}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id={`fields-${index}-type-label`}>
                        Type
                      </InputLabel>
                      <Select
                        labelId={`fields-${index}-type-label`}
                        id={`fields-${index}-type-input`}
                        label="Type"
                        {...field}
                      >
                        {schemaTypes.map((schemaType) => {
                          return (
                            <MenuItem key={schemaType} value={schemaType}>
                              {schemaType}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name={`fields.${index}.facet`}
                  control={control}
                  rules={{}}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id={`fields-${index}-facet-label`}>
                        Facet
                      </InputLabel>
                      <Select
                        labelId={`fields-${index}-facet-label`}
                        id={`fields-${index}-facet-input`}
                        label="Facet"
                        {...field}
                      >
                        <MenuItem value={"false"}>No</MenuItem>
                        <MenuItem value={"true"}>Yes</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                <IconButton
                  onClick={() => {
                    console.log(index);
                    remove(index);
                  }}
                >
                  <Icon
                    icon="gg:remove"
                    color={theme.palette.error as unknown as string}
                  />
                </IconButton>
              </Stack>
            );
          })}
        </>
      )}
      <LoadingButton
        sx={{ mt: 2 }}
        loading={loading}
        variant="contained"
        onClick={handleSubmit(saveIndex)}
      >
        Save
      </LoadingButton>
    </Box>
  );
};
