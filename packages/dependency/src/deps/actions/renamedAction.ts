import { IAction, Renamed } from '../types';
import { modifyModuleOfGraph } from '../utils';

export const renamedAction: IAction<Renamed> = async (
  { from, to },
  opts,
  ctx
) => {
  ctx.deps = await modifyModuleOfGraph(from, to, ctx.deps);
  ctx.pkMap[to] = ctx.pkMap[from];
  delete ctx.pkMap[to];
  return ctx;
};
