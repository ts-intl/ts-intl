import madge from 'madge';

import { IContext, IOpts } from '../types';
import { offsprings } from './madge';

/**
 * collect graph of given path, no recursion
 * @param module
 * @param madgeConfig
 * @returns
 */
export const getDependenciesNoRecursion = async (
  module: string,
  madgeConfig: IOpts['madgeConfig']
) => {
  const instance = await madge(module, {
    ...madgeConfig,
    dependencyFilter: (id) => id === module,
  });
  return instance.obj()[module] || [];
};

export const getModulesDependencies = (
  modules: string[],
  graph: IContext['graph']
) => {
  return modules.reduce((all, module) => {
    offsprings(module, graph).forEach((v) => (all[v] = true));
    return all;
  }, {} as Record<string, boolean>);
};

/**
 * generate new graph without given module
 * @param module
 * @param graph
 * @returns
 */
export const deleteModule = async (
  module: string,
  graph: IContext['graph']
) => {
  const depends = (await madge(graph)).depends(module);
  const res = { ...graph };
  delete res[module];
  depends.forEach((v) => {
    res[v] = res[v].filter((v) => v !== module);
  });
  return res;
};

/**
 * generate new graph with changed module
 * @param module
 * @param graph
 * @returns
 */
export const changeModule = async (
  fromModule: string,
  toModule: string,
  graph: IContext['graph']
) => {
  const depends = (await madge(graph)).depends(fromModule);
  const res = { ...graph };
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
