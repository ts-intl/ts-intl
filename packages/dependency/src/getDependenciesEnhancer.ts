import { getDependencies } from './getDependencies';
import { getModuleIntlKeysMap } from './utils';

export const getDependenciesEnhancer = async (
  res: ReturnType<typeof getDependencies>
) => {
  const { modules, graph, pathIntlKeysMap } = await res;
  const moduleIntlKeysMap = Object.fromEntries(
    modules.map((module) => [
      module,
      Array.from(getModuleIntlKeysMap(module, graph, pathIntlKeysMap)),
    ])
  );

  const usedIntlKeys = Object.fromEntries(
    Array.from(
      Object.values(moduleIntlKeysMap).reduce((all, keys) => {
        keys.forEach((key) => all.add(key));
        return all;
      }, new Set<string>())
    ).map((key) => [key, true])
  );

  return {
    graph,
    pathIntlKeysMap,
    moduleIntlKeysMap,
    usedIntlKeys,
  };
};
