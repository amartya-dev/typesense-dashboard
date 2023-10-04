import {
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { useEffect, useState } from "react";
import { SearchResponseHit } from "typesense/lib/Typesense/Documents";

export const Reports = () => {
  const client = getTypeSenseClient(AuthUtils.getAuthDetails());
  const [selectedIndex, setSelectedIndex] = useState<string>("");
  const [reports, setReports] =
    useState<SearchResponseHit<{ [key: string]: any }>[]>();
  const [collections, setCollections] = useState<string[]>([]);
  const [numPages, setNumPages] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const getReports = async () => {
    const response = await client
      .collections(selectedIndex)
      .documents()
      .search({
        q: ".*",
        query_by: "q",
        sort_by: "count:desc",
        page: selectedPage,
      });

    console.log(response);
    setReports(response.hits);
    response.hits && setNumPages(response.out_of / response.hits?.length);
  };
  const getAllIndices = async () => {
    const collections = await client.collections().retrieve();
    const setUpCollections = collections.map((collection) => collection.name);
    setCollections(setUpCollections);
  };

  useEffect(() => {
    getAllIndices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedIndex !== "") {
      getReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, selectedPage]);

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ width: "90%" }}
      >
        <Typography variant="h3" component="h1">
          Analytics Reports
        </Typography>
        <FormControl sx={{ minWidth: "15%" }}>
          <InputLabel id="index-select-label">Collection</InputLabel>
          <Select
            labelId="index-select-label"
            id="index-select"
            value={selectedIndex}
            label="Collection"
            onChange={(event) => {
              setSelectedIndex(event.target.value);
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
      </Stack>
      <Typography variant="h6" component="h2">
        Popular Searches
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="left">Query</TableCell>
              <TableCell align="left">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports?.map((report) => {
              return (
                <TableRow key={report.document.id}>
                  <TableCell align="left">{report.document.id}</TableCell>
                  <TableCell align="left">{report.document.q}</TableCell>
                  <TableCell align="left">{report.document.count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {numPages > 1 && (
        <Pagination
          color="primary"
          sx={{ mt: 2 }}
          count={numPages}
          page={selectedPage}
          onChange={(event, value) => {
            setSelectedPage(value);
          }}
        />
      )}
    </>
  );
};
