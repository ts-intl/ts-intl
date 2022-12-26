## I18n dictionary/messages generator

Generate dictionary/messages by locale object or file, features:

1. replace subtrees/leaves with fallback locale
2. file system support
3. `include`/`exclude` support to reduce size of dictionary

```ts
// treat top level key as namespace
export type Dictionary = {
  [key: string]: string | Dictionary;
};
```

## Installation

```bash
npm install @ts-intl/dictionary
```

## extractDictionary

### Interface

```ts
const extractDictionary = (
  targetDict: Dictionary,
  fallbackDict: Dictionary,
  include: Trie | NSPath,
  exclude?: Trie | NSPath,
  logger?: (path: string) => void
) => Dictionary;
```

### Usage

```ts
const fallbackDict: Dictionary = {
  a: {
    b: 'i am b',
    c: {
      d: 'i am d',
    },
  },
  e: {
    f: 'i am f',
    g: 'i am g',
  },
};
const targetDict: Dictionary = {
  a: {
    b: 'you are b',
  },
  h: 'you are h',
};
const include: NSPath = ['a', ['b'], 'e'];
const exclude: NSPath = ['e', ['f']];

const extractedDictionary = extractDictionary(
  targetDict,
  fallbackDict,
  include,
  exclude
);
// {
//   'a': {
//     'b': 'you are b'
//   },
//   'e': {
//     'g': 'i am g' // fallback
//   }
// }
```

### Configuration

| Property       | Type                     | Default     | Description                                                                                                                                                  |
| :------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `targetDict`   | `Dictionary`             | `null`      | original target(current) locale dictionary                                                                                                                   |
| `fallbackDict` | `Dictionary`             | `null`      | the `extractedDictionary` is based on `fallbackDict`, fill subtrees/leaves with keys/values if exist in `targetDict`, normally we provide an `en` dictionary |
| `include`      | `NSPath` \| `Trie`       | `null`      | `extractedDictionary` only include given paths                                                                                                               |
| `exclude`      | `NSPath` \| `Trie`       | `null`      | ignore paths which within in `include`                                                                                                                       |
| `logger`       | `(path: string) => void` | `undefined` | log missing keys/values in `targetDict`                                                                                                                      |

## extractDictionaryFs

### Interface

```ts
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
const extractDictionaryFs = (configs: Configs) => Dictionary;
```

### Usage

```ts
// auto detect locale files:
// 1. if [root]/[locale] exist, merge [root]/[locale]/*.json, each json name is namespace.
// 2. if [root]/[locale].json exist, just using it.
// 3. otherwise return {}(empty Dictionary).
const extractedDictionary = extractDictionaryFs({
  root: '/',
  lng: 'fr',
  fallbackLng: 'en',
  ns: {
    include: ['a', ['b'], 'e'],
    exclude: ['e', ['f']],
  },
});
```

### Configuration

| Property      | Type                                    | Default     | Description                                               |
| :------------ | --------------------------------------- | ----------- | --------------------------------------------------------- |
| `root`        | `string`                                | `null`      | absolute path of locale directory                         |
| `lng`         | `string`                                | `null`      | locale, should same as locale file name                   |
| `fallbackLng` | `string`                                | `undefined` | fallback locale, should same as fallback locale file name |
| `ns`          | `{ include: NSPath, exclude?: NSPath }` | `null`      | `include` and `exclude`                                   |

## Extend custom generator

```ts
const getDictFromRemote = (lng: string) => Promise<Dictionary>;
const customExtractDictionary = async () => {
  return extractDictionary(
    await getDictFromRemote('fr'),
    await getDictFromRemote('en'),
    ['a'],
    ['a', ['b', 'c']]
  );
};
```
