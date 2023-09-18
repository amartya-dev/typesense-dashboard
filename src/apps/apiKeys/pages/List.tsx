import { useEffect, useState } from "react";
import { KeysRetrieveSchema } from "typesense/lib/Typesense/Keys";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";

export const ApiKeysList = () => {
  const [apiKeys, setApiKeys] = useState<KeysRetrieveSchema>();

  const getAllApiKeys = async () => {
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    const response = await client.keys().retrieve();
    setApiKeys(response);
  };

  const deleteApiKey = async (keyId: number) => {
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    await client.keys(keyId).delete();
    window.location.reload();
  };

  useEffect(() => {
    getAllApiKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Typography variant="h3" component="h1">
        API keys
      </Typography>
      {apiKeys?.keys.length === 0 && (
        <Typography sx={{ marginTop: "2%" }} variant="h5">
          No API Keys yet
        </Typography>
      )}
      <List>
        {apiKeys?.keys.map((apiKey) => {
          return (
            <ListItem
              key={apiKey.id}
              secondaryAction={
                <IconButton
                  onClick={async () => {
                    await deleteApiKey(apiKey.id);
                  }}
                  edge="end"
                  aria-label="delete"
                >
                  <Icon icon="material-symbols:delete-sharp" />
                </IconButton>
              }
            >
              <ListItemText
                primary={`Actions: ${apiKey.actions.join(
                  ","
                )} Collections: ${apiKey.collections.join(",")}`}
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
