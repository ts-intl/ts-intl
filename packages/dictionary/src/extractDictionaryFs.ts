import {
  buildTrieByNSPath,
  defaultJsonFileParser,
  Dictionary,
  getFsResolver,
  NSPath,
  Trie,
} from '@ts-intl/shared';

import { extractDictionary } from './extractDictionary';

type Configs = {
  root: string;
  lng: string;
  fallbackLng?: string;
  ns: {
    include: NSPath;
    exclude?: NSPath;
  };
  parseJsonFile?: (jsonPath: string) => Dictionary;
};

export const extractDictionaryFs = ({
  root,
  lng,
  fallbackLng,
  ns: { include, exclude },
  parseJsonFile = defaultJsonFileParser,
}: Configs) => {
  const includeTrie = buildTrieByNSPath(include);
  const excludeTrie = exclude?.length ? buildTrieByNSPath(exclude) : undefined;
  const [lngDict, fallbackDict] = [lng, fallbackLng].map((lng) =>
    initDictionaryFs(root, parseJsonFile, includeTrie, excludeTrie, lng)
  );
  return extractDictionary(lngDict, fallbackDict, includeTrie, excludeTrie);
};

const initDictionaryFs = (
  root: string,
  parseJsonFile: NonNullable<Configs['parseJsonFile']>,
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
  const { dictionary } = getFsResolver(root, locale, parseJsonFile, include)();
  return include.reduce((res, namespace) => {
    res[namespace] = dictionary?.[namespace] ?? {};
    return res;
  }, {} as Dictionary);
};
