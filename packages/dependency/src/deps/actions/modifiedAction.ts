import { IAction, Modified } from '../types';
import { collectDepsNoRecursion } from '../utils';

export const modifiedAction: IAction<Modified> = async (
  { from },
  { collectKeys, ignoreCollectDeps, madgeConfig },
  ctx
) => {
  // update ctx
  ctx.pkMap[from] = await collectKeys(from);
  if (!ignoreCollectDeps) {
    ctx.deps[from] = await collectDepsNoRecursion(from, madgeConfig);
  }
  return ctx;
};
