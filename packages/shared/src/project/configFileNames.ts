import { join } from 'path';

export const configFileNames = {
  project: 'ts-intl.config.json',
  eslint: 'ts-intl.eslintrc.js',
  cacheGraph: 'graph.json',
  cacheKeysOfPaths: 'keysOfPaths.json',
  cacheKeysOfEntries: 'keysOfEntries.json',
  cacheUsedKeys: 'usedKeys.json',
} as const;

export const getProjectConfigPaths = (root = process.cwd()) => ({
  project: join(root, configFileNames.project),
  eslint: join(root, configFileNames.eslint),
});

export const getDepsCachePaths = (cacheDir: string) => ({
  cacheGraph: join(cacheDir, configFileNames.cacheGraph),
  cacheKeysOfPaths: join(cacheDir, configFileNames.cacheKeysOfPaths),
  cacheKeysOfEntries: join(cacheDir, configFileNames.cacheKeysOfEntries),
  cacheUsedKeys: join(cacheDir, configFileNames.cacheUsedKeys),
});
