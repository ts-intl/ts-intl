import { readdirSync, statSync, watch } from 'fs';
import { join, parse, resolve } from 'path';

import { Dictionary } from '../types';
import { defaultJsonFileParser } from '../utils';
import {
  DictionaryController,
  DictionaryResolver,
  DictionaryWatcher,
  getDictionaryController,
} from './dictionaryController';

interface Configs {
  fullPath: string;
  locale: string;
  parseJsonFile?: (path: string) => Dictionary;
  watchMode?: boolean;
}

let singleton: DictionaryController | undefined;
export const getDictionaryControllerFsSingleton = (configs: Configs) => {
  return singleton ?? getDictionaryControllerFs(configs);
};

export const getDictionaryControllerFs = ({
  fullPath,
  locale,
  parseJsonFile = defaultJsonFileParser,
  watchMode = false, // watch only when run by vscode-eslint, command line should not watch which would cause eslint not exit
}: Configs) => {
  return getDictionaryController(
    getFsResolver(fullPath, locale, parseJsonFile),
    getFsWatcher(parseJsonFile, watchMode)
  );
};

export const getFsResolver =
  (
    fullPath: string,
    locale: string,
    parseJsonFile: NonNullable<Configs['parseJsonFile']>,
    include?: string[]
  ): DictionaryResolver =>
  () => {
    try {
      const dirPath = resolve(fullPath, locale);
      if (statSync(dirPath).isDirectory()) {
        const dictionary: Dictionary = {};
        const files = readdirSync(dirPath);
        for (const filename of files) {
          const { name, ext } = parse(filename);
          if (/^\.json$/.test(ext) && (!include || include.includes(name)))
            dictionary[name] = parseJsonFile(join(dirPath, filename));
        }
        return {
          multiSources: true,
          path: dirPath,
          dictionary,
        };
      }
    } catch (err) {
      //
    }

    try {
      // [locale].json
      const jsonPath = resolve(fullPath, `${locale}.json`);
      if (statSync(jsonPath).isFile()) {
        return {
          multiSources: false,
          path: jsonPath,
          dictionary: parseJsonFile(jsonPath),
        };
      }
    } catch (err) {
      //
    }
    return {};
  };

const getFsWatcher =
  (
    parseJsonFile: NonNullable<Configs['parseJsonFile']>,
    watchMode?: boolean
  ): DictionaryWatcher =>
  ({ multiSources = false, localePath, updateDictionary }) => {
    if (!watchMode || !localePath) return () => {};
    const fsWatcher = watch(localePath, { recursive: true }, (_, filename) => {
      const { name, ext } = parse(filename);
      if (/^\.json$/.test(ext)) {
        updateDictionary(
          multiSources
            ? { [name]: parseJsonFile(join(localePath, filename)) }
            : parseJsonFile(localePath), // [locale].json ignore [locale] ns
          !multiSources
        );
      }
    });
    return () => fsWatcher.close();
  };
