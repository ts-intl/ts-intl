import {
  buildNSPathByKeys,
  Dictionary,
  getDictionaryControllerFs,
  NSPath,
  Project,
  readJsonFile,
} from '@ts-intl/shared';

import { extractDictionaryFs } from './extractDictionaryFs';

export const getDictionaryOfProject = (
  { projectConfig }: Pick<Project, 'projectConfig'>,
  optimize?: {
    parseJsonFile?: (jsonPath: string) => Dictionary;
  }
): Dictionary =>
  Object.fromEntries(
    [projectConfig.locale.basic, ...projectConfig.locale.others].map(
      (locale) => [
        locale,
        getDictionaryControllerFs({
          fullPath: projectConfig.path.dictionary,
          locale,
          parseJsonFile: optimize?.parseJsonFile,
        }).dictionary,
      ]
    )
  );

export const getLocaleDictionaryOfProject = (
  {
    projectConfig,
    cacheFilePaths,
  }: Pick<Project, 'projectConfig' | 'cacheFilePaths'>,
  locale: string,
  optimize?: {
    parseJsonFile?: (jsonPath: string) => Dictionary;
    include?: NSPath;
    exclude?: NSPath;
    entry?: string;
  }
): Dictionary =>
  optimize?.include
    ? extractDictionaryFs({
        root: projectConfig.path.dictionary,
        lng: locale,
        fallbackLng: projectConfig.locale.basic,
        ns: {
          include: optimize.entry
            ? buildNSPathByKeys(
                readJsonFile(cacheFilePaths.keysOfEntries)[optimize.entry] ??
                  [],
                projectConfig.syntax.nsDivider,
                projectConfig.syntax.keyDivider
              )
            : optimize.include,
          exclude: optimize.exclude,
        },
        parseJsonFile: optimize.parseJsonFile,
      })
    : getDictionaryControllerFs({
        fullPath: projectConfig.path.dictionary,
        locale,
        parseJsonFile: optimize?.parseJsonFile,
      }).dictionary;
