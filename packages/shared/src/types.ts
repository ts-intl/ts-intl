export type NSPath = (string | NSPath)[];

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
