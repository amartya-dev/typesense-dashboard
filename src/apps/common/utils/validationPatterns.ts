export const validationPatterns: { [key: string]: RegExp } = {
  host: /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
  port: /^[0-9]{4}/,
  protocol: /http[s]?/,
};
