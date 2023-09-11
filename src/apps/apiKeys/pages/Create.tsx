import React, { useEffect, useState } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";

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

  const getAllCollections = async () => {
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    const response = await client.collections().retrieve();
    setAvailableCollections(response.map((collection) => collection.name));
  };

  useEffect(() => {
    getAllCollections();
  }, []);

  return (
    <>
      <Typography variant="h3" component="h1">
        Add an API Key
      </Typography>
      <FormControl sx={{ width: "40%", mt: 4, mb: 4 }}>
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
    </>
  );
};
