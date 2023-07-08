import { readdirSync, statSync } from 'fs';
import { join, parse, resolve } from 'path';

import { Dictionary, Reader } from '../types';
import { DictionaryResolver } from './types';

export const dictionaryResolverFs = (
  localPath: string,
  locale: string,
  reader: Reader<Dictionary>,
  include?: string[]
): ReturnType<DictionaryResolver> => {
  try {
    const dirPath = resolve(localPath, locale);
    if (statSync(dirPath).isDirectory()) {
      const dictionary: Dictionary = {};
      const files = readdirSync(dirPath);
      for (const filename of files) {
        const { name, ext } = parse(filename);
        if (/^\.json$/.test(ext) && (!include || include.includes(name)))
          dictionary[name] = reader(join(dirPath, filename));
      }
      return {
        multiSources: true,
        localePath: dirPath,
        dictionary,
      };
    }
  } catch (err) {
    //
  }

  try {
    // [locale].json
    const jsonPath = resolve(localPath, `${locale}.json`);
    if (statSync(jsonPath).isFile()) {
      return {
        multiSources: false,
        localePath: jsonPath,
        dictionary: reader(jsonPath),
      };
    }
  } catch (err) {
    //
  }
  return {};
};
