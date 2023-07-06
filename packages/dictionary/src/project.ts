import {
  buildNSPathByKeys,
  Dictionary,
  getDepsCachePaths,
  getDictionaryControllerFs,
  NSPath,
  ProjectConfig,
  readJsonFile,
} from '@ts-intl/shared';

import { extractDictionaryFs } from './extractDictionaryFs';

export const getDictionaryOfProject = (
  projectConfig: ProjectConfig,
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
  projectConfig: ProjectConfig,
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
            ? buildNSPathWithCache(projectConfig, optimize.entry)
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

const buildNSPathWithCache = (projectConfig: ProjectConfig, entry: string) =>
  buildNSPathByKeys(
    readJsonFile(
      getDepsCachePaths(projectConfig.path.cache).cacheKeysOfEntries
    )[entry] ?? [],
    projectConfig.syntax.nsDivider,
    projectConfig.syntax.keyDivider
  );
