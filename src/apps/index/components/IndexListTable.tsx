import { useEffect, useState } from "react";
import { CollectionSchema } from "typesense/lib/Typesense/Collection";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { Button, Card, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { renderCellExpand } from "apps/common/components/GridCellExpand";

const columns: GridColDef[] = [
  { field: "name", headerName: "Index Name", width: 200 },
  { field: "num_documents", headerName: "Number of Documents", width: 240 },
  {
    field: "schema",
    headerName: "Schema",
    width: 260,
    renderCell: renderCellExpand,
  },
];

interface CollectionSchemeWithId extends CollectionSchema {
  id: string;
  schema: string;
}

export const IndexListTable = () => {
  const connectionValue = AuthUtils.getAuthDetails();
  const client = getTypeSenseClient(connectionValue);
  const [rows, setRows] = useState<CollectionSchemeWithId[]>([]);
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

  const getAllIndices = async () => {
    const collections = await client.collections().retrieve();
    const setUpCollections = collections.map((collection) => {
      return {
        ...collection,
        id: collection.name,
        schema: JSON.stringify(collection.fields, undefined, 4),
      };
    });
    setRows(setUpCollections);
  };

  useEffect(() => {
    getAllIndices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearIndices = () => {
    selectedRows.forEach(async (selectedRow) => {
      await client
        .collections(selectedRow as string)
        .documents()
        .delete({
          filter_by: "id:>0",
        });
      enqueueSnackbar(`Cleared index: ${selectedRow}`);
    });
  };

  const deleteIndices = () => {
    selectedRows.forEach(async (selectedRow) => {
      await client.collections(selectedRow as string).delete();
      enqueueSnackbar(`Deleted index: ${selectedRow}`);
    });
  };

  return (
    <Card sx={{ width: "90%", marginTop: "2%", borderRadius: 5 }} elevation={4}>
      {selectedRows.length > 0 && (
        <Stack direction="row" spacing={2}>
          <Button
            variant="text"
            onClick={() => {
              clearIndices();
              window.location.reload();
            }}
          >
            Clear
          </Button>
          <Button
            variant="text"
            onClick={() => {
              deleteIndices();
              window.location.reload();
            }}
          >
            Delete
          </Button>
        </Stack>
      )}
      {rows.length >= 1 ? (
        <DataGrid
          rows={rows}
          onRowSelectionModelChange={(rowSelectionModel) => {
            setSelectedRows(rowSelectionModel);
          }}
          columns={columns}
          checkboxSelection
        />
      ) : (
        <Typography variant="h5" padding={2}>
          No indices yet
        </Typography>
      )}
    </Card>
  );
};
