import { IContext, IOpts } from '../types';
import { genDepsOfEntries } from './graph';

/**
 * generate new pkMap which only includes offsprings of entries
 * @param entries
 * @param deps
 * @param pkMap
 * @returns
 */
export const excludePKOutsideEntries = (
  entries: string[],
  deps: IContext['deps'],
  pkMap: IContext['pkMap'],
  removeEmptyPK = false
): IContext['pkMap'] => {
  const depsMap = genDepsOfEntries(entries, deps);
  return Object.fromEntries(
    Object.keys(pkMap)
      .filter((v) => (!removeEmptyPK || pkMap[v].length) && depsMap[v])
      .map((v) => [v, pkMap[v]])
  );
};

/**
 * generate new pkMap which only includes given modules
 * @param modules
 * @param collectKeys
 * @returns
 */
export const collectKeysOfModules = async (
  modules: string[],
  collectKeys: IOpts['collectKeys']
) => {
  const pkMap: IContext['pkMap'] = {};
  modules.forEach(async (v) => (pkMap[v] = await collectKeys(v)));
  return pkMap;
};
