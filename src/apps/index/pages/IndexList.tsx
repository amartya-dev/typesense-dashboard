import { Typography } from "@mui/material";
import { IndexListTable } from "../components/IndexListTable";

export const IndexList = () => {
  return (
    <>
      <Typography variant="h3" component="h1">
        Available Indices
      </Typography>
      <IndexListTable />
    </>
  );
};
