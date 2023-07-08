import {
  buildTrieByNSPath,
  Dictionary,
  dictionaryResolverFs,
  NSPath,
  Reader,
  readJsonFile,
  Trie,
} from '@ts-intl/shared';

import { extractDictionary } from './extractDictionary';

export const extractDictionaryFs = ({
  localePath,
  locale,
  basicLocale,
  include,
  exclude,
  reader = readJsonFile,
}: {
  localePath: string;
  locale: string;
  include: NSPath;
  basicLocale?: string;
  exclude?: NSPath;
  reader?: Reader<Dictionary>;
}) => {
  const includeTrie = buildTrieByNSPath(include);
  const excludeTrie = exclude?.length ? buildTrieByNSPath(exclude) : undefined;
  const [lngDict, fallbackDict] = [locale, basicLocale].map((locale) =>
    initDictionaryFs(localePath, reader, includeTrie, excludeTrie, locale)
  );
  return extractDictionary(lngDict, fallbackDict, includeTrie, excludeTrie);
};

const initDictionaryFs = (
  localePath: string,
  reader: Reader<Dictionary>,
  includeTrie: Trie,
  excludeTrie?: Trie,
  locale?: string
) => {
  if (!locale) return {};
  const include: string[] = [];
  includeTrie.childrenNameMap.forEach((v) => {
    if (!v.name || excludeTrie?.get(v.name)?.isLeaf) return;
    include.push(v.name);
  });
  const { dictionary } = dictionaryResolverFs(
    localePath,
    locale,
    reader,
    include
  );
  return include.reduce((res, namespace) => {
    res[namespace] = dictionary?.[namespace] ?? {};
    return res;
  }, {} as Dictionary);
};
