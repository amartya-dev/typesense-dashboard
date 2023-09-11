import { Icon } from "@iconify/react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import AnalyticsRule, {
  AnalyticsRuleSchema,
} from "typesense/lib/Typesense/AnalyticsRule";

interface AnalyticsRuleCardProps {
  rule: AnalyticsRuleSchema;
}

export const AnalyticsRulesCard = ({ rule }: AnalyticsRuleCardProps) => {
  const info: { [key: string]: number | string } = {
    sources: rule.params.source.collections.join(", "),
    destination: rule.params.destination.collection,
    limit: rule.params.limit,
  };

  const deleteRule = async () => {
    const client = getTypeSenseClient(AuthUtils.getAuthDetails());
    await (client.analytics.rules(rule.name) as AnalyticsRule).delete();
  };

  return (
    <Card sx={{ width: "70%" }}>
      <CardHeader
        title={rule.name}
        action={
          <IconButton onClick={deleteRule}>
            <Icon icon="material-symbols:delete" />
          </IconButton>
        }
      />
      <CardContent>
        {Object.keys(info).map((key) => {
          return (
            <Stack direction="row" spacing={3} key={key}>
              <Box justifyContent="flex-end" display="flex" flex={1}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  {key}
                </Typography>
              </Box>
              <Box justifyContent="flex-start" display="flex" flex={1}>
                {info[key]}
              </Box>
            </Stack>
          );
        })}
      </CardContent>
    </Card>
  );
};
