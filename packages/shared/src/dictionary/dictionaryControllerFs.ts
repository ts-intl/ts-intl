import { existsSync, readdirSync, watch } from 'fs';
import { join, parse, resolve } from 'path';

import { Dictionary } from '../types';
import { defaultJsonFileParser } from '../utils';
import {
  DictionaryController,
  DictionaryResolver,
  DictionaryWatcher,
} from './dictionaryController';

interface Configs {
  fullPath: string;
  locale: string;
  parseJsonFile?: (path: string) => Dictionary;
  watchMode?: boolean;
}

export class DictionaryControllerFs extends DictionaryController {
  static singleton: DictionaryControllerFs;
  static getSingleton(configs: Configs) {
    return (DictionaryControllerFs.singleton =
      DictionaryControllerFs.singleton || new DictionaryControllerFs(configs));
  }

  constructor({
    fullPath,
    locale,
    parseJsonFile = defaultJsonFileParser,
    watchMode = false, // watch only when run by vscode-eslint, command line should not watch which would cause eslint not exit
  }: Configs) {
    super(
      getFsResolver(fullPath, locale, parseJsonFile),
      getFsWatcher(parseJsonFile, watchMode)
    );
  }
}

const getFsResolver =
  (
    fullPath: string,
    locale: string,
    parseJsonFile: NonNullable<Configs['parseJsonFile']>
  ): DictionaryResolver =>
  () => {
    const jsonPath = resolve(fullPath, `${locale}.json`);
    if (existsSync(jsonPath)) {
      // [locale].json
      return {
        multiSources: false,
        path: jsonPath,
        dictionary: parseJsonFile(jsonPath),
      };
    }
    const dirPath = resolve(fullPath, locale);
    return {
      multiSources: true,
      path: dirPath,
      dictionary: readdirSync(dirPath).reduce((dictionary, filename) => {
        const { name, ext } = parse(filename);
        if (/^\.json$/.test(ext))
          dictionary[name] = parseJsonFile(join(dirPath, filename));
        return dictionary;
      }, {} as Dictionary),
    };
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
