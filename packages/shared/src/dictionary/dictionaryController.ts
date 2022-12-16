import { Dictionary } from '../types';
import { hasPathToLeaf, traverseLeaves } from './utils';

export interface DictionaryResolver {
  (): { multiSources?: boolean; localePath?: string; dictionary?: Dictionary };
}

export interface DictionaryWatcher {
  (config: {
    multiSources?: boolean;
    localePath?: string;
    updateDictionary: (dict?: Dictionary, overwrite?: boolean) => void;
  }): () => void;
}

export class DictionaryController {
  public dictionary: Dictionary = {};
  public closeWatcher?: () => void;

  constructor(resolver: DictionaryResolver, watcher?: DictionaryWatcher) {
    const { multiSources, localePath, dictionary } = resolver();
    this.dictionary = dictionary ?? {};
    this.closeWatcher = watcher?.({
      multiSources,
      localePath,
      updateDictionary: (newDict, reset) => {
        this.dictionary = reset
          ? {
              ...newDict,
            }
          : {
              ...this.dictionary,
              ...newDict,
            };
      },
    });
  }

  destroy = () => {
    this.closeWatcher?.();
  };

  hasPathToLeaf = (path: string, nsDivider: string, keyDivider: string) => {
    return hasPathToLeaf({
      dictionary: this.dictionary,
      path,
      nsDivider,
      keyDivider,
    });
  };

  traverse = (
    cb: (path: string) => void,
    nsDivider: string,
    keyDivider: string
  ) => {
    return traverseLeaves({
      dictionary: this.dictionary,
      nsDivider,
      keyDivider,
      cb,
    });
  };
}
