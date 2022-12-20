import { IContext } from '../types';
import { getModulesDependencies } from './graph';
import { offsprings } from './madge';

/**
 * generate new pathIntlKeysMap which only includes offsprings of modules
 * @param modules
 * @param graph
 * @param pathIntlKeysMap
 * @returns
 */
export const extractPathIntlKeysMap = (
  modules: string[],
  graph: IContext['graph'],
  pathIntlKeysMap: IContext['pathIntlKeysMap'],
  ignoreEmpty = false
): IContext['pathIntlKeysMap'] => {
  const modulesDepsMap = getModulesDependencies(modules, graph);
  return Object.fromEntries(
    Object.keys(pathIntlKeysMap)
      .filter(
        (v) => (!ignoreEmpty || pathIntlKeysMap[v].length) && modulesDepsMap[v]
      )
      .map((v) => [v, pathIntlKeysMap[v]])
  );
};

/**
 * get intl keys of a module and offsprings
 * @param module
 * @param graph
 * @param pathIntlKeysMap
 * @returns
 */
export const getModuleIntlKeysMap = (
  module: string,
  graph: IContext['graph'],
  pathIntlKeysMap: IContext['pathIntlKeysMap']
) => {
  return offsprings(module, graph).reduce((keys, module) => {
    (pathIntlKeysMap[module] || []).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>());
};
