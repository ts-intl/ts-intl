import { Deleted, IAction } from '../types';
import { deleteModule } from '../utils';

export const deletedAction: IAction<Deleted> = async ({ from }, opts, ctx) => {
  ctx.graph = await deleteModule(from, ctx.graph);
  delete ctx.pathIntlKeysMap[from];
  return ctx;
};
