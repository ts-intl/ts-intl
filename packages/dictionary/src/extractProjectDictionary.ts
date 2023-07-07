import {
  buildNSPathByKeys,
  Dictionary,
  DictionaryController,
  NSPath,
  Project,
  Reader,
  readJsonFile,
} from '@ts-intl/shared';

import { extractDictionaryFs } from './extractDictionaryFs';

export const extractProjectDictionary = (
  { projectConfig }: Pick<Project, 'projectConfig'>,
  optimize?: {
    reader?: Reader<Dictionary>;
  }
): Dictionary =>
  Object.fromEntries(
    [projectConfig.locale.basic, ...projectConfig.locale.others].map(
      (locale) => [
        locale,
        DictionaryController.getControllerFs({
          localePath: projectConfig.path.dictionary,
          locale,
          reader: optimize?.reader,
        }).dictionary,
      ]
    )
  );

export const extractProjectDictionaryWithLocale = (
  {
    projectConfig,
    cacheFilePaths,
  }: Pick<Project, 'projectConfig' | 'cacheFilePaths'>,
  locale: string,
  optimize?: {
    reader?: Reader<Dictionary>;
    include?: NSPath;
    exclude?: NSPath;
    entry?: string;
  }
): Dictionary =>
  optimize?.include
    ? extractDictionaryFs({
        localePath: projectConfig.path.dictionary,
        locale,
        basicLocale: projectConfig.locale.basic,
        include: optimize.entry
          ? buildNSPathByKeys(
              readJsonFile(cacheFilePaths.keysOfEntries)[optimize.entry] ?? [],
              projectConfig.syntax.nsDivider,
              projectConfig.syntax.keyDivider
            )
          : optimize.include,
        exclude: optimize.exclude,
        reader: optimize.reader,
      })
    : DictionaryController.getControllerFs({
        localePath: projectConfig.path.dictionary,
        locale,
        reader: optimize?.reader,
      }).dictionary;
