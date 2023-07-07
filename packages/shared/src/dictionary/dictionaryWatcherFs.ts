import { watch } from 'fs';
import { join, parse } from 'path';

import { Dictionary, Reader } from '../types';
import { DictionaryWatcher } from './types';

export const dictionaryWatcherFs = ({
  multiSources = false,
  localePath,
  updateDictionary,
  reader,
  watchMode,
}: {
  multiSources?: boolean;
  localePath?: string;
  updateDictionary: (dict?: Dictionary, overwrite?: boolean) => void;
  reader: Reader<Dictionary>;
  watchMode?: boolean;
}): ReturnType<DictionaryWatcher> => {
  if (!watchMode || !localePath) return () => {};
  const fsWatcher = watch(localePath, { recursive: true }, (_, filename) => {
    const { name, ext } = parse(filename);
    if (/^\.json$/.test(ext)) {
      updateDictionary(
        multiSources
          ? { [name]: reader(join(localePath, filename)) }
          : reader(localePath), // [locale].json ignore [locale] ns
        !multiSources
      );
    }
  });
  return () => fsWatcher.close();
};
