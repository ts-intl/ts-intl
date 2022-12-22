import { IAction, Modified } from '../types';
import { getDependenciesNoRecursion } from '../utils';

export const modifiedAction: IAction<Modified> = async (
  { from },
  { extractIntlKeys, ignoreCollectDeps, madgeConfig },
  ctx
) => {
  // update ctx
  ctx.pathIntlKeysMap[from] = await extractIntlKeys(from);
  if (!ignoreCollectDeps) {
    ctx.graph[from] = await getDependenciesNoRecursion(from, madgeConfig);
  }
  return ctx;
};
