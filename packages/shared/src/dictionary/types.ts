import { Dictionary } from '../types';

type Resolved = {
  multiSources?: boolean;
  localePath?: string;
  dictionary?: Dictionary;
};

export interface DictionaryResolver {
  (): Resolved;
}

export interface DictionaryWatcher {
  (config: {
    multiSources?: boolean;
    localePath?: string;
    updateDictionary: (dict?: Dictionary, overwrite?: boolean) => void;
  }): () => void;
}
