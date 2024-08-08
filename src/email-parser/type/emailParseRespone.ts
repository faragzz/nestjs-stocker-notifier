export type EmailParseResponse = {
  attachments: any[];
  headers: Record<string, any>;
  headerLines: {
    key: string;
    line: string;
  }[];
  html: string;
};
