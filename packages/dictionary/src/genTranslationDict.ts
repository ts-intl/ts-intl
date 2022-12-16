import { access } from 'fs/promises';
import { resolve } from 'path';
import {
  buildTrieByNSPath,
  defaultJsonFileParser,
  Dictionary,
  NSPath,
  Trie,
} from 'shared';

export type ResolveConfig = {
  root: string;
  lng: string;
  fallbackLng?: string;
  ns: {
    include: NSPath;
    exclude?: NSPath;
  };
  parseJsonFile?: (jsonPath: string) => Promise<Dictionary> | Dictionary;
};

export const genTranslationDictFs = async ({
  root,
  lng,
  fallbackLng,
  ns: { include, exclude },
  parseJsonFile = defaultJsonFileParser,
}: ResolveConfig) => {
  const includeTrie = buildTrieByNSPath(include);
  const excludeTrie = exclude?.length ? buildTrieByNSPath(exclude) : undefined;
  const [lngDict, fallbackDict] = await Promise.all(
    [lng, fallbackLng].map((lng) =>
      initTranslationDict(root, parseJsonFile, includeTrie, excludeTrie, lng)
    )
  );
  return genTranslationDict(
    lngDict,
    fallbackDict,
    lng,
    includeTrie,
    excludeTrie
  );
};

export const genTranslationDict = (
  dict: Dictionary,
  fallbackDict: Dictionary,
  lng: string,
  includeTrie: Trie,
  excludeTrie?: Trie
) => {
  const path: string[] = [];
  const dfs = (
    base: Dictionary,
    target?: Dictionary,
    includeTrie?: Trie,
    excludeTrie?: Trie
  ) => {
    const resDict: Dictionary = {};
    Object.entries(base).forEach(([key, baseChild]) => {
      const includeTrieChild = includeTrie?.get(key);
      const excludeTrieChild = excludeTrie?.get(key);
      if ((includeTrie && !includeTrieChild) || excludeTrieChild?.isLeaf)
        return;
      path.push(key);
      let targetChild = target?.[key];
      if (typeof baseChild === 'string') {
        // endpoint
        if (!targetChild || typeof targetChild !== 'string') {
          targetChild = baseChild;
          // console.error(`${lng}: missed value of ${path.join('/')}`);
        }
        resDict[key] = targetChild;
      } else {
        if (!targetChild || typeof targetChild === 'string') {
          targetChild = undefined;
          // console.error(`${lng}: missed key of ${path.join('/')}`);
        }
        resDict[key] = dfs(
          baseChild,
          targetChild,
          includeTrieChild?.isLeaf ? undefined : includeTrieChild,
          excludeTrieChild
        );
      }
      path.pop();
    });
    return resDict;
  };
  return dfs(fallbackDict, dict, includeTrie, excludeTrie);
};

const initTranslationDict = async (
  root: string,
  parseJsonFile: NonNullable<ResolveConfig['parseJsonFile']>,
  includeTrie: Trie,
  excludeTrie?: Trie,
  lng?: string
) => {
  if (!lng) return {};
  // lng folder
  try {
    const dirPath = resolve(root, lng);
    await access(dirPath);
    const modules: string[] = [];
    includeTrie.childrenNameMap.forEach((v) => {
      if (!v.name || excludeTrie?.get(v.name)?.isLeaf) return;
      modules.push(v.name);
    });
    const res = await Promise.all(
      modules.map(async (mod) => {
        try {
          return await parseJsonFile(resolve(dirPath, `${mod}.json`));
        } catch (err) {
          // no module found
          console.error(
            `resolve ${lng} ${mod}.json failed, fallback to empty object`
          );
          return {};
        }
      })
    );
    return modules.reduce((dict, mod, i) => {
      dict[mod] = res[i];
      return dict;
    }, {} as Dictionary);
  } catch (err) {
    console.error(err, `resolve ${lng} folder failed`);
  }
  // lng.json
  try {
    return await parseJsonFile(resolve(root, `${lng}.json`));
  } catch (err) {
    console.error(`resolve ${lng}.json failed`);
  }
  return {};
};
