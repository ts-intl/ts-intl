import { Dictionary, NSPath } from 'shared';

export type ResolveConfig = {
  root: string;
  lng: string;
  fallbackLng?: string;
  ns: {
    include: NSPath;
    exclude?: NSPath;
  };
  parseJsonFile?: (jsonPath: string) => Promise<Dictionary>;
};
