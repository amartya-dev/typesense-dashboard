import { useState } from "react";
import { SearchResponseHit } from "typesense/lib/Typesense/Documents";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Stack,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";

interface DocumentCartProps {
  document: SearchResponseHit<{ [key: string]: any }>;
}

interface DocumentDeetProps {
  documentKey: string;
  document: { [key: string]: any };
}

interface ValueComponentProps {
  documentKey: string;
  value: any;
  jsonExpanded: boolean;
  setJsonExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ValueComponent = ({
  value,
  documentKey,
  jsonExpanded,
  setJsonExpanded,
}: ValueComponentProps) => {
  if (
    ["string", "number"].includes(typeof value) &&
    documentKey !== "post_content"
  ) {
    return <Typography variant="body1">{value}</Typography>;
  }
  if (jsonExpanded) {
    return (
      <pre>
        <Typography variant="body1">
          {documentKey !== "post_content" ? (
            JSON.stringify(value, undefined, 4)
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: value,
              }}
            />
          )}
        </Typography>
        <Button
          variant="text"
          sx={{ textTransform: "none" }}
          onClick={() => {
            setJsonExpanded(!jsonExpanded);
          }}
        >
          Collapse <Icon style={{ marginLeft: "4px" }} icon="ooui:collapse" />
        </Button>
      </pre>
    );
  }
  return (
    <Button
      variant="text"
      sx={{ textTransform: "none" }}
      onClick={() => {
        setJsonExpanded(!jsonExpanded);
      }}
    >
      {JSON.stringify(value).slice(0, 10)}{" "}
      <Icon style={{ marginLeft: "4px" }} icon="ooui:expand" />
    </Button>
  );
};

const DocumentDetails = ({ document, documentKey }: DocumentDeetProps) => {
  const [jsonExpanded, setJsonExpanded] = useState<boolean>(false);
  return (
    <Stack direction="row" spacing={3} key={documentKey}>
      <Box justifyContent="flex-end" display="flex" flex={1}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: "bold",
          }}
        >
          {documentKey}
        </Typography>
      </Box>
      <Box justifyContent="flex-start" display="flex" flex={1}>
        <ValueComponent
          value={document[documentKey]}
          documentKey={documentKey}
          jsonExpanded={jsonExpanded}
          setJsonExpanded={setJsonExpanded}
        />
      </Box>
    </Stack>
  );
};

export const DocumentCard = ({ document }: DocumentCartProps) => {
  const documentDetails = document.document;
  const docKeys = Object.keys(documentDetails);
  const [showMore, setShowMore] = useState<boolean>(false);

  return (
    <Card elevation={2} sx={{ width: "70%", mt: 2, borderRadius: 5 }}>
      <CardHeader title={documentDetails.post_title} />
      <CardContent>
        {docKeys.slice(0, 10).map((documentKey) => {
          return (
            <DocumentDetails
              document={documentDetails}
              documentKey={documentKey}
            />
          );
        })}
        {!showMore && docKeys.length >= 10 && (
          <Button
            sx={{ textTransform: "none" }}
            onClick={() => {
              setShowMore(!showMore);
            }}
          >
            Show more attributes ({docKeys.length - 10})
            {<Icon style={{ marginLeft: "4px" }} icon="ooui:expand" />}
          </Button>
        )}
        <Collapse in={showMore}>
          {docKeys.slice(10).map((documentKey) => {
            return (
              <DocumentDetails
                document={documentDetails}
                documentKey={documentKey}
              />
            );
          })}
          {showMore && (
            <Button
              sx={{ textTransform: "none" }}
              onClick={() => {
                setShowMore(!showMore);
              }}
            >
              Show fewer attributes
              {<Icon style={{ marginLeft: "4px" }} icon="ooui:collapse" />}
            </Button>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};
