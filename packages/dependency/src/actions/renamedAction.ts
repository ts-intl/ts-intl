import { IAction, Renamed } from '../types';
import { changeModule } from '../utils';

export const renamedAction: IAction<Renamed> = async (
  { from, to },
  opts,
  ctx
) => {
  ctx.graph = await changeModule(from, to, ctx.graph);
  ctx.pathIntlKeysMap[to] = ctx.pathIntlKeysMap[from];
  delete ctx.pathIntlKeysMap[to];
  return ctx;
};
