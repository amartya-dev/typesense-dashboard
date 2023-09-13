import React, { useEffect, useState } from "react";
import {
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { LoadingButton } from "@mui/lab";
import { APIKeyViewModal } from "../components/ApiKeyView";
import { KeyCreateSchema } from "typesense/lib/Typesense/Key";

const actionPermissions: { [key: string]: string[] } = {
  collections: ["create", "delete", "get", "list", "*"],
  document: [
    "search",
    "get",
    "create",
    "upsert",
    "update",
    "delete",
    "import",
    "export",
    "*",
  ],
  aliases: ["list", "get", "create", "delete", "*"],
  synonyms: ["list", "get", "create", "delete", "*"],
  overrides: ["list", "get", "create", "delete", "*"],
  keys: ["list", "get", "create", "delete", "*"],
  "metrics.json": ["list"],
  debug: ["list"],
};

export const CreateApiKey = () => {
  const [keyType, setKeyType] = useState<"admin" | "search" | "fine-grained">(
    "admin"
  );
  const [selectedActionPermissions, setSelectedActionPermissions] = useState<
    string[]
  >([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [availableCollections, setAvailableCollections] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const saveKey = async () => {
    setLoading(true);
    let createParams: KeyCreateSchema;
    if (keyType === "admin") {
      createParams = {
        description: "Admin Key.",
        actions: ["*"],
        collections: ["*"],
      };
    } else if (keyType === "search") {
      createParams = {
        description: "Search Key",
        actions: ["documents:search"],
        collections:
          selectedCollections.length >= 0 ? selectedCollections : ["*"],
      };
    } else {
      createParams = {
        description: "Custom fine grained key",
        actions: selectedActionPermissions,
        collections:
          selectedCollections.length >= 0 ? selectedCollections : ["*"],
      };
    }
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    const response = await client.keys().create(createParams);
    setApiKey(response.value);
    setLoading(false);
  };

  const getAllCollections = async () => {
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    const response = await client.collections().retrieve();
    setAvailableCollections(response.map((collection) => collection.name));
  };

  useEffect(() => {
    getAllCollections();
  }, []);

  return (
    <Container>
      <APIKeyViewModal
        open={dialogOpen}
        setOpen={setDialogOpen}
        apiKey={apiKey || ""}
      />
      <Typography variant="h3" display="flex" flex={1} component="h1">
        Add an API Key
      </Typography>
      <FormControl fullWidth sx={{ mb: 2, mt: 4 }}>
        <InputLabel id="key-type-label">Key Type</InputLabel>
        <Select
          labelId="key-type-label"
          id="key-type-select"
          value={keyType}
          label="Key Type"
          onChange={(event) => {
            setKeyType(
              event.target.value as "admin" | "search" | "fine-grained"
            );
          }}
        >
          <MenuItem value={"admin"}>Admin Key</MenuItem>
          <MenuItem value={"search"}>Search Only Key</MenuItem>
          <MenuItem value={"fine-grained"}>Custom</MenuItem>
        </Select>
      </FormControl>
      {["fine-grained", "search"].includes(keyType) && (
        <>
          {availableCollections.map((collection) => {
            return (
              <FormControlLabel
                label={collection}
                control={
                  <Checkbox
                    onChange={(event) => {
                      if (event.target.value) {
                        if (
                          !selectedCollections.find(
                            (value) => value === collection
                          )
                        ) {
                          setSelectedCollections([
                            ...selectedCollections,
                            collection,
                          ]);
                        }
                      } else {
                        setSelectedCollections(
                          selectedCollections.filter(
                            (value) => value !== collection
                          )
                        );
                      }
                    }}
                  />
                }
              />
            );
          })}
        </>
      )}
      {keyType === "fine-grained" &&
        Object.keys(actionPermissions).map((action) => {
          return (
            <React.Fragment key={action}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {action}
              </Typography>
              {actionPermissions[action].map((permission) => {
                return (
                  <FormControlLabel
                    label={permission}
                    control={
                      <Checkbox
                        onChange={(event) => {
                          if (event.target.value) {
                            if (
                              !selectedActionPermissions.find(
                                (value) => value === `${action}:${permission}`
                              )
                            ) {
                              setSelectedActionPermissions([
                                ...selectedActionPermissions,
                                `${action}:${permission}`,
                              ]);
                            }
                          } else {
                            setSelectedActionPermissions(
                              selectedActionPermissions.filter(
                                (value) => value !== `${action}:${permission}`
                              )
                            );
                          }
                        }}
                      />
                    }
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      <LoadingButton loading={loading} onClick={saveKey} variant="contained">
        Add Key
      </LoadingButton>
    </Container>
  );
};
