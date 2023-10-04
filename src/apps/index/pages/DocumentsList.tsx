import { useEffect, useState } from "react";
import {
  SearchResponse,
  SearchResponseHit,
} from "typesense/lib/Typesense/Documents";
import { Client } from "typesense";

import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputBase,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";

import { AuthUtils } from "apps/auth/utils";
import { getTypeSenseClient } from "apps/common/utils/typesense";
import { DocumentCard } from "../components/DocumentCard";
import { useDebounce } from "apps/common/hooks/useDebounce";
import { CollectionSchema } from "typesense/lib/Typesense/Collection";

export const DocumentsList = () => {
  let client: Client;
  try {
    const connectionDetails = AuthUtils.getAuthDetails();
    client = getTypeSenseClient(connectionDetails);
  } catch (err) {
    console.log(err);
  }

  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce<string>(searchQuery, 500);
  const [queryableParams, setQueryableParams] = useState<string[]>([]);
  const [documents, setDocuments] = useState<
    SearchResponseHit<{ [key: string]: any }>[]
  >([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [collectionObjects, setCollectionObjects] = useState<
    CollectionSchema[]
  >([]);
  const [queryResponse, setQueryResponse] =
    useState<SearchResponse<{ [key: string]: any }>>();
  const [selectSearchableVisible, setSelectSearchableVisible] =
    useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const getRequiredDocuments = async () => {
    const response = await client
      .collections(selectedCollection)
      .documents()
      .search({
        q: searchQuery !== "" ? searchQuery : "*",
        query_by: queryableParams.join(","),
        page: selectedPage,
      });
    setDocuments(response.hits || []);
    response?.hits && setNumPages(response.out_of / response.hits?.length);
    setQueryResponse(response);
  };

  const getAllIndices = async () => {
    const collections = await client.collections().retrieve();
    const setUpCollections = collections.map((collection) => collection.name);
    setCollectionObjects(collections);
    setCollections(setUpCollections);
    setSelectedCollection(
      setUpCollections.length >= 1 ? setUpCollections[0] : ""
    );
  };

  useEffect(() => {
    getAllIndices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      getRequiredDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, selectedCollection, selectedPage]);

  const theme = useTheme();

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ width: "90%" }}
      >
        <Typography variant="h3" component="h1">
          Documents
        </Typography>
        <FormControl sx={{ minWidth: "15%" }}>
          <InputLabel id="index-select-label">Collection</InputLabel>
          <Select
            labelId="index-select-label"
            id="index-select"
            value={selectedCollection}
            label="Collection"
            onChange={(event) => {
              setSelectedCollection(event.target.value);
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
      <Paper
        component="form"
        sx={{
          padding: "1%",
          marginTop: "2%",
          marginBottom: "4%",
          display: "flex",
          alignItems: "center",
          width: "90%",
          border: "2px",
          borderStyle: "solid",
          borderColor: theme.palette.primary.main,
          borderRadius: 4,
        }}
        elevation={0}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for records"
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
        />
        <Icon
          color={theme.palette.primary.main}
          fontSize={24}
          icon="material-symbols:search"
        />
        <Divider
          sx={{
            height: 30,
            ml: 1,
            mr: 1,
            borderColor: theme.palette.primary.main,
          }}
          orientation="vertical"
        />
        <Typography variant="body2">
          {queryResponse?.found} hits matched in {queryResponse?.search_time_ms}{" "}
          ms
        </Typography>
      </Paper>
      <Collapse in={selectSearchableVisible}>
        <Grid container spacing={2} mb={2}>
          {collectionObjects
            .find((collectionObject) => {
              return collectionObject.name === selectedCollection;
            })
            ?.fields?.map((field) => {
              return (
                field.name !== ".*" && (
                  <Grid item key={field.name} sm={6} md={4}>
                    <FormControlLabel
                      label={field.name}
                      control={
                        <Checkbox
                          onChange={(event) => {
                            if (event.target.value) {
                              if (
                                !queryableParams.find(
                                  (value) => value === field.name
                                )
                              ) {
                                setQueryableParams([
                                  ...queryableParams,
                                  field.name,
                                ]);
                              }
                            } else {
                              setQueryableParams(
                                queryableParams.filter(
                                  (value) => value !== field.name
                                )
                              );
                            }
                          }}
                        />
                      }
                    />
                  </Grid>
                )
              );
            })}
          <Button
            sx={{ textTransform: "none", marginTop: "5%" }}
            onClick={() => {
              setSelectSearchableVisible(!selectSearchableVisible);
            }}
          >
            Hide this section.
            {<Icon style={{ marginLeft: "4px" }} icon="ooui:collapse" />}
          </Button>
        </Grid>
      </Collapse>
      {!selectSearchableVisible && (
        <Button
          sx={{ textTransform: "none", marginBottom: "1%" }}
          onClick={() => {
            setSelectSearchableVisible(!selectSearchableVisible);
          }}
        >
          Select Searchable parameters.
          {<Icon style={{ marginLeft: "4px" }} icon="ooui:expand" />}
        </Button>
      )}
      {documents.map((document) => {
        return <DocumentCard key={document.document.id} document={document} />;
      })}

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
