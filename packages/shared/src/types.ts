export type NSPath = (string | NSPath)[];

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

export type Dictionary = {
  [key: string]: string | Dictionary;
};

export type FlagDict = {
  [key: string]: true | FlagDict;
};

export enum DictionaryParseErrorType {
  MissingNamespace = 1,
  MissingKey = 2,
  MissingChild = 3,
  MissingValue = 4,
}
