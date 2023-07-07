import { PipeDependenciesRes } from './types';
import { getModuleIntlKeysMap } from './utils';

export const pipeDependenciesRes: PipeDependenciesRes<{
  graph: Record<string, string[]>;
  modules: string[];
  pathIntlKeysMap: Record<string, string[]>;
  moduleIntlKeysMap: Record<string, string[]>;
  usedIntlKeys: Record<string, boolean>;
}> = ({ modules, graph, pathIntlKeysMap }) => {
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
    modules,
  };
};
