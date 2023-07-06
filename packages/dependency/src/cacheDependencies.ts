import {
  getDepsCachePaths,
  ProjectConfig,
  readJsonFile,
  writeJsonFile,
} from '@ts-intl/shared';

import { getDependenciesEnhancer } from './getDependenciesEnhancer';
import { getDependenciesFs } from './getDependenciesFs';

export const cacheDependencies = (projectConfig: ProjectConfig) => {
  getDependenciesEnhancer(
    getDependenciesFs(
      projectConfig.path.entry,
      {
        madgeConfig: {
          ...projectConfig.madgeConfig,
          baseDir: projectConfig.path.root,
        },
      },
      {
        ...projectConfig.integration,
        ...projectConfig.syntax,
      }
    )
  ).then(({ graph, pathIntlKeysMap, moduleIntlKeysMap, usedIntlKeys }) => {
    const depsCachePaths = getDepsCachePaths(projectConfig.path.cache);
    logEntriesDiff(moduleIntlKeysMap, depsCachePaths.cacheKeysOfEntries);
    return Promise.all([
      writeJsonFile(depsCachePaths.cacheGraph, graph),
      writeJsonFile(depsCachePaths.cacheKeysOfPaths, pathIntlKeysMap),
      writeJsonFile(depsCachePaths.cacheKeysOfEntries, moduleIntlKeysMap),
      writeJsonFile(depsCachePaths.cacheUsedKeys, usedIntlKeys),
    ]);
  });
};

const logEntriesDiff = (
  modulesUsedKeys: Record<string, string[] | undefined>,
  cacheKeysOfEntries: string
) => {
  let old: typeof modulesUsedKeys = {};
  try {
    old = readJsonFile(cacheKeysOfEntries);
  } catch (err) {
    // console.error(err);
  }
  Object.entries(modulesUsedKeys).forEach(([module, keys]) => {
    console.log(module, old[module]?.length ?? 0, '=>', keys?.length ?? 0);
  });
};
