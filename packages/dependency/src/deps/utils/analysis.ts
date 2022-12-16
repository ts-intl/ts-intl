import { IContext } from '../types';
import { offsprings } from './madge';

export const getKeysOfOffsprings = (
  module: string,
  deps: IContext['deps'],
  pkMap: IContext['pkMap']
) => {
  return offsprings(module, deps).reduce((keys, module) => {
    (pkMap[module] || []).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>());
};
