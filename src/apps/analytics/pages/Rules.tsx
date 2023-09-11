import { Button, Stack, Typography } from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { useEffect, useState } from "react";
import { Client } from "typesense";
import { AnalyticsRulesRetrieveSchema } from "typesense/lib/Typesense/AnalyticsRules";
import { AddRule } from "../components/AddRule";
import { AnalyticsRulesCard } from "../components/AnalyticsRuleCard";

export const AnalyticsRules = () => {
  let client: Client;
  try {
    const connectionDetails = AuthUtils.getAuthDetails();
    client = getTypeSenseClient(connectionDetails);
  } catch (err) {
    console.log(err);
  }

  const [analyticsRules, setAnalyticsRules] =
    useState<AnalyticsRulesRetrieveSchema>();
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);

  const getAnalyticsRules = async () => {
    const response = await client.analytics.rules().retrieve();
    setAnalyticsRules(response as AnalyticsRulesRetrieveSchema);
  };

  useEffect(() => {
    getAnalyticsRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!openAddModal) {
      getAnalyticsRules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddModal]);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ width: "90%", mb: 3 }}
      >
        <Typography variant="h3" component="h1">
          Analytics Rules
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            setOpenAddModal(true);
          }}
        >
          + Add Rule
        </Button>
      </Stack>
      <AddRule open={openAddModal} setOpen={setOpenAddModal} />
      {analyticsRules?.rules.map((rule) => {
        return <AnalyticsRulesCard key={rule.name} rule={rule} />;
      })}
    </>
  );
};
