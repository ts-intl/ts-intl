import { Project, readJsonFile, writeJsonFile } from '@ts-intl/shared';

import { getDependenciesEnhancer } from './getDependenciesEnhancer';
import { getDependenciesFs } from './getDependenciesFs';

export const cacheDependencies = ({
  projectConfig,
  cacheFilePaths,
}: Pick<Project, 'projectConfig' | 'cacheFilePaths'>) => {
  getDependenciesEnhancer(
    getDependenciesFs(
      projectConfig.path.entry,
      {
        madgeConfig: {
          ...projectConfig.madgeConfig,
          baseDir: projectConfig.path.base,
        },
      },
      {
        ...projectConfig.integration,
        ...projectConfig.syntax,
      }
    )
  ).then(({ graph, pathIntlKeysMap, moduleIntlKeysMap, usedIntlKeys }) => {
    logEntriesDiff(moduleIntlKeysMap, cacheFilePaths.keysOfEntries);
    return Promise.all([
      writeJsonFile(cacheFilePaths.graph, graph),
      writeJsonFile(cacheFilePaths.keysOfPaths, pathIntlKeysMap),
      writeJsonFile(cacheFilePaths.keysOfEntries, moduleIntlKeysMap),
      writeJsonFile(cacheFilePaths.usedKeys, usedIntlKeys),
    ]);
  });
};

const logEntriesDiff = (
  modulesUsedKeys: Record<string, string[] | undefined>,
  keysOfEntries: string
) => {
  let old: typeof modulesUsedKeys = {};
  try {
    old = readJsonFile(keysOfEntries);
  } catch (err) {
    // console.error(err);
  }
  Object.entries(modulesUsedKeys).forEach(([module, keys]) => {
    console.log(module, old[module]?.length ?? 0, '=>', keys?.length ?? 0);
  });
};
