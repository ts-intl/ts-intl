import madge from 'madge';

import { IContext, IOpts } from '../types';
import { offsprings } from './madge';

/**
 * collect deps of given path, no recursion
 * @param module
 * @param madgeConfig
 * @returns
 */
export const collectDepsNoRecursion = async (
  module: string,
  madgeConfig: IOpts['madgeConfig']
) => {
  const instance = await madge(module, {
    ...madgeConfig,
    dependencyFilter: (id) => id === module,
  });
  return instance.obj()[module] || [];
};

export const genDepsOfEntries = (entries: string[], deps: IContext['deps']) => {
  return entries.reduce((all, entry) => {
    offsprings(entry, deps).forEach((v) => (all[v] = true));
    return all;
  }, {} as Record<string, boolean>);
};

/**
 * generate new graph without given module
 * @param module
 * @param deps
 * @returns
 */
export const excludeModuleOfGraph = async (
  module: string,
  deps: IContext['deps']
) => {
  const depends = (await madge(deps)).depends(module);
  const res = { ...deps };
  delete res[module];
  depends.forEach((v) => {
    res[v] = res[v].filter((v) => v !== module);
  });
  return res;
};

/**
 * generate new graph with changed module
 * @param module
 * @param deps
 * @returns
 */
export const modifyModuleOfGraph = async (
  fromModule: string,
  toModule: string,
  deps: IContext['deps']
) => {
  const depends = (await madge(deps)).depends(fromModule);
  const res = { ...deps };
  res[toModule] = res[fromModule];
  delete res[fromModule];
  depends.forEach((v) => {
    const idx = res[v].indexOf(fromModule);
    if (idx !== -1) {
      res[v][idx] = toModule;
    }
  });
  return res;
};
