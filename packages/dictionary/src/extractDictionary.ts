import { buildTrieByNSPath, Dictionary, NSPath, Trie } from '@ts-intl/shared';

export const extractDictionary = (
  dict: Dictionary,
  fallbackDict: Dictionary,
  include: Trie | NSPath,
  exclude?: Trie | NSPath,
  logger?: (path: string) => void
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
          logger?.(`missed value of ${path.join('/')}`);
        }
        resDict[key] = targetChild;
      } else {
        if (!targetChild || typeof targetChild === 'string') {
          targetChild = undefined;
          logger?.(`missed key of ${path.join('/')}`);
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
  return dfs(
    fallbackDict,
    dict,
    include instanceof Array ? buildTrieByNSPath(include) : include,
    exclude instanceof Array ? buildTrieByNSPath(exclude) : exclude
  );
};
