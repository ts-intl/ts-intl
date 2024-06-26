export { DictionaryController, dictionaryResolverFs } from './dictionary';
export {
  readJsonFile,
  writeFileWithDetection,
  writeFileWithDetectionSync,
  writeJsonFile,
  writeJsonFileSync,
} from './fs';
export { Project } from './project';
export { buildNSPathByKeys, buildTrieByNSPath, Trie } from './trie';
export type { Dictionary, NSPath, ProjectConfig, Reader } from './types';
export { DictionaryParseErrorType } from './types';
