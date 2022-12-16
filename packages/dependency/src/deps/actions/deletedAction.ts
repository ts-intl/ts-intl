import { Deleted, IAction } from '../types';
import { excludeModuleOfGraph } from '../utils';

export const deletedAction: IAction<Deleted> = async ({ from }, opts, ctx) => {
  ctx.deps = await excludeModuleOfGraph(from, ctx.deps);
  delete ctx.pkMap[from];
  return ctx;
};
