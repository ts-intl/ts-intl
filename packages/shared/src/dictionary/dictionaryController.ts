import { readJsonFile } from '../fs';
import { Dictionary, Reader } from '../types';
import { dictionaryResolverFs } from './dictionaryResolverFs';
import { dictionaryWatcherFs } from './dictionaryWatcherFs';
import { hasPathToLeaf } from './hasPathToLeaf';
import { traverseLeaves } from './traverseLeaves';
import { DictionaryResolver, DictionaryWatcher } from './types';

interface FsOpts {
  localePath: string;
  locale: string;
  reader?: Reader<Dictionary>;
  watchMode?: boolean;
}

export class DictionaryController {
  static singletonFs?: DictionaryController;
  static getControllerFs({
    localePath,
    locale,
    reader = readJsonFile,
    watchMode = false, // watch only when run by vscode-eslint, command line should not watch which would cause eslint not exit
  }: FsOpts) {
    return new DictionaryController(
      () => dictionaryResolverFs(localePath, locale, reader),
      ({ multiSources, localePath, updateDictionary }) =>
        dictionaryWatcherFs({
          multiSources,
          localePath,
          updateDictionary,
          watchMode,
          reader,
        })
    );
  }
  static getControllerSingletonFs(opts: FsOpts) {
    return (DictionaryController.singletonFs =
      DictionaryController.singletonFs ??
      DictionaryController.getControllerFs(opts));
  }

  public dictionary: Dictionary = {};
  public closeWatcher?: () => void;

  constructor(resolver: DictionaryResolver, watcher?: DictionaryWatcher) {
    const { multiSources, localePath, dictionary } = resolver();
    this.dictionary = dictionary ?? this.dictionary;
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
    cb: (path: string, value: string) => void,
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
