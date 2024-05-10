import { extractProjectDictionaryWithLocale } from '@ts-intl/dictionary';
import type { Dictionary, NSPath } from '@ts-intl/shared';
import { Project } from '@ts-intl/shared';
import { readFileSync } from 'fs';

import type { IntlProviderProps } from './types';

export interface WithI18nDepsOpts {
  rootDir: string;
  defaultLanguage: string;

  disable?: boolean;
  ns?: {
    include?: NSPath;
    exclude?: NSPath;
  };
  entry?: string;

  dictCache?: Cache;
  jsonFileCache?: Cache;
  ttl?: number;
  isEntryDepsEnabled?: boolean;

  formatEntry?: (entry: string) => string;
}

/**
 * run only in server side
 * @param param0
 * @returns
 */
export const withI18nDeps = ({
  rootDir,
  defaultLanguage,
  ns,
  disable,
  entry,
  dictCache,
  jsonFileCache,
  ttl,
  isEntryDepsEnabled,
  formatEntry = (entry) => entry,
}: WithI18nDepsOpts): ((context: {
  locale?: string;
}) => Promise<IntlProviderProps>) => {
  const project = Project.getSingleton(rootDir);
  const { include = [], exclude } = ns ?? {};
  return async ({ locale }) => {
    const currentLanguage = locale ?? defaultLanguage;
    const props: IntlProviderProps = {
      defaultLanguage,
      currentLanguage,
      dictionary: {},
    };
    if (disable) return props;
    if (!isEntryDepsEnabled) {
      // development
      props.dictionary = extractProjectDictionaryWithLocale(
        project,
        currentLanguage,
        {
          include,
          exclude,
        },
      );
    } else {
      // production
      props.dictionary = cacheDict(
        JSON.stringify({
          include,
          exclude,
          entry,
          locale: currentLanguage,
        }),
        () =>
          extractProjectDictionaryWithLocale(project, currentLanguage, {
            include,
            exclude,
            entry: entry ? formatEntry(entry) : undefined,
            reader: (jsonPath) =>
              parseJsonFileWithCache(jsonPath, jsonFileCache, ttl),
          }),
        dictCache,
        ttl,
      );
    }
    return props;
  };
};

interface Cache {
  get: (key: string) => unknown;
  set: (key: string, value: unknown, ttl?: number) => void;
}

const TTL_IN_SECOND = 60 * 60 * 24; // day

const cacheDict = (
  cacheKey: string,
  getter: () => Dictionary,
  dictCache?: Cache,
  ttl = TTL_IN_SECOND,
): Dictionary => {
  if (!dictCache) return getter();
  const dict = dictCache.get(cacheKey) ?? getter();
  if (!dictCache.get(cacheKey)) {
    dictCache.set(cacheKey, dict, ttl);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return dict as Dictionary;
};

const parseJsonFileWithCache = <T>(
  jsonPath: string,
  jsonFileCache?: Cache,
  ttl = TTL_IN_SECOND,
) => {
  const getter = () =>
    JSON.parse(readFileSync(jsonPath, { encoding: 'utf-8' }));
  if (!jsonFileCache) return getter();
  if (!jsonFileCache.get(jsonPath)) {
    jsonFileCache.set(
      jsonPath,
      JSON.parse(readFileSync(jsonPath, { encoding: 'utf-8' })),
      ttl,
    );
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return jsonFileCache.get(jsonPath) as T;
};
