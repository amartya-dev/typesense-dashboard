import { Typography } from "@mui/material";
import { AddIndexForm } from "../components/AddIndexForm";

export const AddIndex = () => {
  return (
    <>
      <Typography variant="h3" component="h1">
        Add an index
      </Typography>
      <AddIndexForm />
    </>
  );
};
