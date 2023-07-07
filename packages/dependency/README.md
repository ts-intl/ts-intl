# I18n keys dependency analysis

Useful tools to help collect and reveal i18n keys usage, features:

1. generate dependency graph
2. generate used i18n keys which grouped by file path
   Easy integration, reduce size of dictionary/messages and helpful to manage locale files.

```ts
type DepsGraph = Record<string, string[]>;
const depsGraphExample: DepsGraph = {
  '/src/a.tsx': ['/src/b.ts', '/src/c.tsx'],
  '/src/b.ts': ['/src/c.tsx'],
};

type PathIntlKeysMap = Record<string, string[]>;
const pathIntlKeysMapExample = {
  '/src/a.tsx': ['global.keyA', 'global.keyB', 'global.keyC'],
  '/src/b.ts': ['global.keyB', 'global.keyC'],
  '/src/c.tsx': ['global.keyC'],
};
```

## Installation

```bash
npm install @ts-intl/dependency
```

## getDependencies

### Interface

```ts
const getDependencies = (
  statuses: FileStatus[],
  entries: string[],
  opts: {
    extractIntlKeys?: (module: string) => string[] | Promise<string[]>;
    ignoreCollectDeps?: boolean;
    madgeConfig: MadgeConfig;
  },
  ctx: {
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
  },
  extractIntlKeysOpts?: {
    funcNamePattern?: string;
    hookNamePattern?: string;
    richNamePattern?: string;
    argIdx?: number;
  }
) =>
  Promise<{
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
    modules: string[];
  }>;
```

### Usage

```ts
const { graph, pathIntlKeysMap, modules } = await getDependencies(statuses, entries, { ...opts, ignoreCollectDeps: true }, ctx, extractIntlKeysOpts);
```

### Configuration

| Property                 | Type                                                                                                    | Default     | Description                                                                                                                                                                                      |
| :----------------------- | ------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `statuses`               | `FileStatus[]`                                                                                          | `null`      | based on increment update, provide a file changed list to specify which files need to update                                                                                                     |
| `entries`                | `string[]`                                                                                              | `null`      | absolute entry path list, to reduce unused result                                                                                                                                                |
| `opts.extractIntlKeys`   | `(module: string) => string[] \| Promise<string[]>`                                                     | `undefined` | custom intl keys extract method, using built-in one if not provide                                                                                                                               |
| `opts.ignoreCollectDeps` | `boolean`                                                                                               | `undefined` | whether re-collect dependency graph, provide `true` to improve performance                                                                                                                       |
| `opts.madgeConfig`       | `MadgeConfig`                                                                                           | `null`      | visit [madge](https://github.com/pahen/madge). `baseDir` is required and should be absolute path of root of your project. The provided config would merge with default config and pass to madge. |
| `ctx.graph`              | `DepsGraph`                                                                                             | `null`      | latest dependency graph of your project(before oldest modified time of `statuses`)                                                                                                               |
| `ctx.pathIntlKeysMap`    | `PathIntlKeysMap`                                                                                       | `null`      | latest path-keys map of your project(before oldest modified time of `statuses`)                                                                                                                  |
| `extractIntlKeysOpts`    | `{    funcNamePattern?: string; hookNamePattern?: string; richNamePattern?: string; argIdx?: number; }` | `undefined` | localization function syntax config for built-in `extractIntlKeys`                                                                                                                               |

## getDependenciesByEntries

> `getDependencies` aim at increment update, `getDependenciesByEntries` is based on `getDependencies` and aiming at full update, which generate `statuses` and `ctx` by itself.

### Interface

```ts
const getDependenciesByEntries = (
  entries: string[],
  opts: {
    extractIntlKeys?: (module: string) => string[] | Promise<string[]>;
    ignoreCollectDeps?: boolean;
    madgeConfig: MadgeConfig;
  },
  extractIntlKeysOpts?: {
    funcNamePattern?: string;
    hookNamePattern?: string;
    richNamePattern?: string;
    argIdx?: number;
  }
) =>
  Promise<{
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
    modules: string[];
  }>;
```

`opts.ignoreCollectDeps` would set to `true` to improve performance.

## getDependenciesFs

> based on `getDependenciesByEntries`, automatically generate `entries` by providing `entry` directory, for example in `nextjs` app, `entry` could be `[nextjs-app-absolute-path]/src/pages`

### Interface

```ts
const getDependenciesFs = (
  entry: string,
  opts: {
    extractIntlKeys?: (module: string) => string[] | Promise<string[]>;
    ignoreCollectDeps?: boolean;
    madgeConfig: MadgeConfig;
  },
  extractIntlKeysOpts?: {
    funcNamePattern?: string;
    hookNamePattern?: string;
    richNamePattern?: string;
    argIdx?: number;
  }
) =>
  Promise<{
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
    modules: string[];
  }>;
```

## pipeDependenciesRes

> Return more useful information

### Interface

```ts
pipeDependenciesRes(
  res: {
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
    modules: string[];
  }
): {
    graph: DepsGraph;
    pathIntlKeysMap: PathIntlKeysMap;
    modules: string[];
    moduleIntlKeysMap: {
      [module: string]: string[]; // used intl key list of a module(include offspring of this module)
    };
    usedIntlKeys: {
      [intlKey: string]: boolean; // whether a intl key used in at least a module(entry)
    };
  }
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
