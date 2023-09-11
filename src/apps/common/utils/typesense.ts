import { Client } from "typesense";

export const getTypeSenseClient = ({
  host,
  port,
  protocol,
  apiKey,
}: {
  host: string;
  port: number;
  protocol: string;
  apiKey: string;
}): Client => {
  const client = new Client({
    nodes: [
      {
        host: host,
        port: port,
        protocol: protocol,
      },
    ],
    apiKey: apiKey,
  });

  return client;
};
