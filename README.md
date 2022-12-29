# Typescript i18n helpers

A full process toolchain to improve i18n performance and efficiency.

## Packages

| Package                                                           | Version                                                                                                                                    |
| :---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [@ts-intl/dependency](packages/dependency/)                       | [![npm version](https://badge.fury.io/js/@ts-intl%2Fdependency.svg)](https://badge.fury.io/js/@ts-intl%2Fdependency)                       |
| [@ts-intl/dictionary](packages/dictionary/)                       | [![npm version](https://badge.fury.io/js/@ts-intl%2Fdictionary.svg)](https://badge.fury.io/js/@ts-intl%2Fdictionary)                       |
| [@ts-intl/eslint-plugin-ts-intl](packages/eslint-plugin-ts-intl/) | [![npm version](https://badge.fury.io/js/@ts-intl%2Feslint-plugin-ts-intl.svg)](https://badge.fury.io/js/@ts-intl%2Feslint-plugin-ts-intl) |

## SSR Integration

### Cache dependencies when `npm prepare`

```ts
import {
  getDependenciesEnhancer,
  getDependenciesFs,
} from '@ts-intl/dependency';
getDependenciesEnhancer(
  getDependenciesFs(
    entryDir,
    {
      madgeConfig,
    },
    syntaxConfig
  )
).then(({ graph, pathIntlKeysMap, moduleIntlKeysMap, usedIntlKeys }) => {
  return Promise.all([
    writeDiskCache(graphCachePath, graph),
    writeDiskCache(pkMapCachePath, pathIntlKeysMap),
    writeDiskCache(entryKeysCachePath, moduleIntlKeysMap),
    writeDiskCache(usedKeysCachePath, usedIntlKeys),
  ]);
});
```

### get server-side dictionary in each entry page

```ts
import { buildNSPathByKeys, Dictionary, NSPath } from '@ts-intl/shared';
import { extractDictionaryFs } from '@ts-intl/dictionary';

const getDictionary = (entryPath: string, locale = 'en') => {
  const keys = readDiskCache(entryKeysCachePath)[entryPath] ?? [];
  const nsPath = buildNSPathByKeys(
    keys,
    syntaxConfig.nsDivider,
    syntaxConfig.keyDivider
  );
  return extractDictionaryFs({
    root: resolve(process.cwd(), 'src/locales'),
    lng: locale,
    fallbackLng: 'en',
    {
      include: nsPath
    }
  });
};
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
