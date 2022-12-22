## Generate i18n k-v dict

```ts
// top level sub-key may treat as namespace
type ResolveDict = {
  [key: string]: string | ResolveDict;
};
```

## Methods

### Basic generate function

missing namespaces or sub-keys of `dict` would replace by `fallbackDict`(and log miss key error), which means `fallbackDict` determine the structure of `resolvedDict`.

```ts
const genTranslationDict = (
  dict: ResolveDict, // target dict
  fallbackDict: ResolveDict, // fallback dict
  lng: string, // language or BCP 47 language tag, for tracking
  includeTrie: Trie, // trie within namespaces or sub-keys, for extracting dict
  excludeTrie?: Trie // for excluding namespaces or sub-keys in extracted dict
) => ResolveDict;
```

### File system generate function

generate args of `genTranslationDict` from file system:

1. generate `dict` and `fallbackDict` by given `root`, `lng` and `fallbackLng`
2. generate `includeTrie` and `excludeTrie` by calling `buildTrieByNSPath(NSPath)`

then call `genTranslationDict`.

specially, namespace rule:

1. if the path `[root]/[lng]` is directory, `dict` would auto combine all contents of json files under `[root]/[lng]`, top level sub-keys of `dict` would be json file names.
2. otherwise, if the path `[root]/[lng].json` exist, structure of `dict` would be same as contents of `[root]/[lng].json`.
3. otherwise would log error, but not breakdown function.

```ts
type NSPath = (string | NSPath)[]; // ['a', ['b', 'c'], 'd'] means 'a.b'| 'a.c' | 'd'
type ResolveConfig = {
  root: string; // locales files directory path
  lng: string; // target language
  fallbackLng?: string; // fallback language
  ns: {
    include: NSPath; // namespaces/sub-keys path for building includeTrie
    exclude?: NSPath; // namespaces/sub-keys path for building excludeTrie
  };
};
const genTranslationDictFs = ({
  root,
  lng,
  fallbackLng,
  ns: { include, exclude },
}: ResolveConfig) => ResolveDict;
```

### Custom generate function(by extend `genTranslationDict`)

```ts
import {
  NSPath,
  genTranslationDict,
  buildTrieByNSPath,
} from '@minted-ui/utils';
const genDict = async (lng: string) => {
  // return any ResolveDict
};

export const customGenTranslationDict = async (
  lng: string,
  fallbackLng: string,
  include: NSPath,
  exclude?: NSPath
) => {
  return genTranslationDict(
    await genDict(lng),
    await genDict(fallbackLng),
    lng,
    buildTrieByNSPath(include),
    buildTrieByNSPath(exclude)
  );
};
```
