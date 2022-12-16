import { FileStatus, IAction, IContext, IOpts } from '../types';
import { deletedAction } from './deletedAction';
import { modifiedAction } from './modifiedAction';
import { newFileAction } from './newFileAction';
import { renamedAction } from './renamedAction';

export const applyActions = async (
  statuses: FileStatus[],
  opts: IOpts,
  ctx: IContext
) => {
  statuses.sort(
    (a, b) =>
      new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
  );
  let newCtx = ctx;
  for (const status of statuses) {
    newCtx = await dispatchAction(status, opts, newCtx);
  }
  return newCtx;
};

const dispatchAction: IAction = async (status, ...args) => {
  switch (status.type) {
    case 'new file':
      return newFileAction(status, ...args);
    case 'renamed':
      return renamedAction(status, ...args);
    case 'deleted':
      return deletedAction(status, ...args);
    case 'modified':
      return modifiedAction(status, ...args);
  }
};
