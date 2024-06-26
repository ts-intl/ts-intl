# Typescript i18n helpers

A full process toolchain to improve i18n performance and efficiency.

## New~ All in one solution

Please visit [@ts-intl/integration](packages/integration/).

## Packages

| Package                                                           | Version                                                                                                                                    |
| :---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [@ts-intl/integration](packages/integration/)                     | [![npm version](https://badge.fury.io/js/@ts-intl%2Fintegration.svg)](https://badge.fury.io/js/@ts-intl%2Fintegration)                     |
| [@ts-intl/dependency](packages/dependency/)                       | [![npm version](https://badge.fury.io/js/@ts-intl%2Fdependency.svg)](https://badge.fury.io/js/@ts-intl%2Fdependency)                       |
| [@ts-intl/dictionary](packages/dictionary/)                       | [![npm version](https://badge.fury.io/js/@ts-intl%2Fdictionary.svg)](https://badge.fury.io/js/@ts-intl%2Fdictionary)                       |
| [@ts-intl/eslint-plugin-ts-intl](packages/eslint-plugin-ts-intl/) | [![npm version](https://badge.fury.io/js/@ts-intl%2Feslint-plugin-ts-intl.svg)](https://badge.fury.io/js/@ts-intl%2Feslint-plugin-ts-intl) |
| [@ts-intl/shared](packages/shared/)                               | [![npm version](https://badge.fury.io/js/@ts-intl%2Fshared.svg)](https://badge.fury.io/js/@ts-intl%2Fshared)                               |
| [@ts-intl/translator](packages/translator/)                       | [![npm version](https://badge.fury.io/js/@ts-intl%2Ftranslator.svg)](https://badge.fury.io/js/@ts-intl%2Ftranslator)                       |

## Shared Project Config(^1.1.0)

```ts
type ProjectConfig = {
  path: {
    base: string; // project base path(root)

    // paths below all relative to base
    dictionary: string; // locale dictionary(direction) path
    entry: string; // entry(directory) path to collect dependencies
    cache: string; // cache(directory) path to store dependencies cache
  };

  locale: {
    basic: string; // basic locale, fallback to this locale when key not found in current locale
    others: string[]; // other locales
  };

  syntax: {
    nsDivider: string; // namespace divider
    keyDivider: string; // key divider
  };

  integration: {
    funcNamePattern: string; // translate function name pattern to match
    hookNamePattern: string; // hook(generate translate function) name pattern to match
    richNamePattern: string; // translate rich function name pattern to match
  };

  translator?: {
    // translator options
    completionOptions?: {
      preset?: {
        override?: boolean;
        presets?: {
          role: 'system' | 'user' | 'assistant';
          content: string;
          name?: string;
        }[];
      };
    };
    descriptions?: Record<string, string | undefined>;
  };

  madgeConfig: MadgeConfig; // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/madge/index.d.ts
};
```

### Project Config File Initialization

```bash
pnpm i @ts-intl/shared
npx ts-intl-init
```

Then edit `ts-intl.config.ts` to fit your project.

### Project Config Management

```ts
import { Project } from '@ts-intl/shared';
// rootPath is dir path where ts-intl.config.ts is located
const project = new Project(rootPath);

// when config file is stable
const projectSingleton = Project.getSingleton(rootPath);
```

### Basic Eslint Rules

```bash
pnpm i @ts-intl/eslint-plugin-ts-intl
npx ts-intl-rules
```

Extends `ts-intl.eslintrc.js` in your eslint config file.

### AI Translator

```bash
pnpm i @ts-intl/translator
npx ts-intl-init-translator
```

Then edit `translator-flow.yml` and `translator-shared.yml` to fit your project.

### Dictionary Management

```bash
pnpm i @ts-intl/dictionary
```

#### Node

```ts
import { Project } from '@ts-intl/shared';
import { extractProjectDictionary, extractProjectDictionaryWithLocale } from '@ts-intl/dictionary';

const project = new Project(rootPath);

const dictionary = extractProjectDictionary(project, { reader }); // optional: custom reader to cache read file

const dictionaryWithLocale = extractProjectDictionaryWithLocale(project, locale, {
  reader,
  include, // include ns path
  exclude, // optional: exclude ns path
  entry, // optional: entry path to match keys in dependencies cache file
});
```

Then inject dictionary into HTML.

#### Browser

Directly use it if `dictionaryWithLocale` is injected,

otherwise if `dictionary` is injected:

```ts
import { extractDictionary } from '@ts-intl/dictionary';

const dictionaryWithLocale = extractDictionary(
  dictionary[locale],
  dictionary[basicLocale],
  include, // include ns path
  exclude, // optional: exclude ns path
);
```

### Dependency Management

```bash
pnpm i @ts-intl/dependency
```

```ts
import { Project } from '@ts-intl/shared';
import { cacheDependenciesRes } from '@ts-intl/dependency';

const project = new Project(rootPath);

cacheDependenciesRes(project);
```

Recommend use it in `production`:

1. build with script above
2. pass `entry` to `extractProjectDictionaryWithLocale`

Which would optimize dictionary size by only including keys which current page really used.

## Work with VSC extension [`lokalise.i18n-ally`](https://github.com/lokalise/i18n-ally)

Help to make project more substantial and efficient.

![demo](./i18n-ally.png)

`.vscode/settings.json`:

```json
{
  "i18n-ally.localesPaths": ["src/locales"], // your locale dictionary path
  "i18n-ally.enabledParsers": ["js", "ts", "json"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.pathMatcher": "{locale}/{namespaces}.json",
  "i18n-ally.namespace": true,
  "i18n-ally.extract.parsers.html": {
    "attributes": ["text", "title", "alt", "placeholder", "label", "aria-label"], // you can add more
    "ignoredTags": ["script", "style"], // you can add more
    "inlineText": true
  }
}
```

`.vscode/extensions.json`:

```json
{
  "recommendations": ["lokalise.i18n-ally"]
}
```

`.vscode/i18n-ally-custom-framework.yml`:

```yml
# .vscode/i18n-ally-custom-framework.yml
languageIds:
  - javascript
  - typescript
  - javascriptreact
  - typescriptreact

usageMatchRegex:
  # The following example shows how to detect `t("your.i18n.keys")`
  # the `{key}` will be placed by a proper keypath matching regex,
  # you can ignore it and use your own matching rules as well
  - "[^\\w\\d]t\\(['\"`]({key})['\"`]"
  - "[^\\w\\d]t\\.rich\\(['\"`]({key})['\"`]"

# If set to true, only enables this custom framework (will disable all built-in frameworks)
monopoly: true
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
