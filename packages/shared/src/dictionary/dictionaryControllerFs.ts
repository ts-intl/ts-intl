import { watch } from 'fs';
import { readdir, stat } from 'fs/promises';
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
  parseJsonFile?: (path: string) => Promise<Dictionary> | Dictionary;
  watchMode?: boolean;
}

let singleton: DictionaryController | undefined;
export const getDictionaryControllerFsSingleton = async (configs: Configs) => {
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
  async () => {
    const dirPath = resolve(fullPath, locale);
    if ((await stat(dirPath)).isDirectory()) {
      const dictionary: Dictionary = {};
      const files = await readdir(dirPath);
      for (const filename of files) {
        const { name, ext } = parse(filename);
        if (/^\.json$/.test(ext) && (!include || include.includes(name)))
          dictionary[name] = await parseJsonFile(join(dirPath, filename));
      }
      return {
        multiSources: true,
        path: dirPath,
        dictionary,
      };
    }

    // [locale].json
    const jsonPath = resolve(fullPath, `${locale}.json`);
    if ((await stat(jsonPath)).isFile()) {
      return {
        multiSources: false,
        path: jsonPath,
        dictionary: await parseJsonFile(jsonPath),
      };
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
    const fsWatcher = watch(
      localePath,
      { recursive: true },
      async (_, filename) => {
        const { name, ext } = parse(filename);
        if (/^\.json$/.test(ext)) {
          updateDictionary(
            multiSources
              ? { [name]: await parseJsonFile(join(localePath, filename)) }
              : await parseJsonFile(localePath), // [locale].json ignore [locale] ns
            !multiSources
          );
        }
      }
    );
    return () => fsWatcher.close();
  };
