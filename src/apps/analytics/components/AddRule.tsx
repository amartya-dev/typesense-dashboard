import React, { SetStateAction, useEffect, useState } from "react";
import { Client } from "typesense";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import AnalyticsRules from "typesense/lib/Typesense/AnalyticsRules";
import { enqueueSnackbar } from "notistack";
import { errorConfig, successConfig } from "apps/common/utils/snackConfigs";

interface AddRuleProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const AddRule = ({ open, setOpen }: AddRuleProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  let client: Client;
  try {
    const connectionDetails = AuthUtils.getAuthDetails();
    client = getTypeSenseClient(connectionDetails);
  } catch (err) {
    console.log(err);
  }

  const [collections, setCollections] = useState<string[]>([]);
  const [sourceCollections, setSourceCollections] = useState<string[]>([]);
  const [destinationCollection, setDestinationCollection] = useState<string>();
  const [analyticsRuleName, setAnalyticsRuleName] = useState<string>("");
  const [limit, setLimit] = useState<number>(1000);

  const getAllCollections = async () => {
    const response = await client.collections().retrieve();
    setCollections(
      response.map((collectionObject) => {
        return collectionObject.name;
      })
    );
  };

  useEffect(() => {
    getAllCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRule = async () => {
    if (sourceCollections.length >= 0 && destinationCollection) {
      try {
        await (client.analytics.rules() as AnalyticsRules).upsert(
          analyticsRuleName,
          {
            type: "popular_queries",
            params: {
              source: {
                collections: sourceCollections,
              },
              destination: {
                collection: destinationCollection,
              },
              limit: limit,
            },
          }
        );
        enqueueSnackbar("Added the rule", successConfig);
      } catch (err: any) {
        console.log(err);
        enqueueSnackbar(err?.message || "", errorConfig);
      }
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      fullScreen={fullScreen}
    >
      <DialogTitle>Add Analytics Rule</DialogTitle>
      <DialogContent>
        <TextField
          label="Rule Name"
          fullWidth
          required
          value={analyticsRuleName}
          sx={{ marginTop: "2%" }}
          onChange={(event) => {
            setAnalyticsRuleName(event.target.value);
          }}
        />
        <Typography variant="body1">Select source Collections</Typography>
        <Grid container spacing={4} mb={2}>
          {collections.map((collection) => {
            return (
              <Grid item key={collection} sm={6} md={6}>
                <FormControlLabel
                  label={collection}
                  control={
                    <Checkbox
                      onChange={(event) => {
                        if (event.target.value) {
                          if (
                            !sourceCollections.find(
                              (value) => value === collection
                            )
                          ) {
                            setSourceCollections([
                              ...sourceCollections,
                              collection,
                            ]);
                          }
                        } else {
                          setSourceCollections(
                            sourceCollections.filter(
                              (value) => value !== collection
                            )
                          );
                        }
                      }}
                    />
                  }
                />
              </Grid>
            );
          })}
        </Grid>
        <Typography variant="body1">Select destination collection</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="index-select-label">Collection</InputLabel>
          <Select
            labelId="index-select-label"
            id="index-select"
            value={destinationCollection}
            label="Collection"
            onChange={(event) => {
              setDestinationCollection(event.target.value);
            }}
          >
            {collections.map((collection) => {
              return (
                <MenuItem key={collection} value={collection}>
                  {collection}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          sx={{ marginTop: "8%" }}
          label="Limit"
          required
          fullWidth
          value={limit}
          onChange={(event) => {
            setLimit(parseInt(event.target.value));
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={saveRule}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
