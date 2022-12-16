import { readFileSync } from 'fs';
import madge from 'madge';
import { relative, resolve } from 'path';

import { applyActions } from './actions';
import { collectKeys as defaultCollectKeys, CollectKeysOpts } from './compiler';
import { FileStatus, IContext, IOpts } from './types';
import { excludePKOutsideEntries, getMadgeConfig } from './utils';

export const getDeps = async (
  statuses: FileStatus[],
  entries: string[],
  opts: Omit<IOpts, 'collectKeys'> & { collectKeys?: IOpts['collectKeys'] },
  ctx: IContext,
  collectKeysOpts?: CollectKeysOpts
) => {
  const { madgeConfig, collectKeys, ...rest } = opts;

  const mergedOpts: IOpts = {
    ...rest,
    madgeConfig: getMadgeConfig(madgeConfig),
    collectKeys:
      collectKeys ??
      ((module: string) => {
        const sourceText = readFileSync(
          resolve(opts.madgeConfig.baseDir, module),
          'utf-8'
        );
        return defaultCollectKeys(
          sourceText,
          collectKeysOpts ?? { funcNamePattern: '' }
        );
      }),
  };

  const { deps, pkMap } = await applyActions(statuses, mergedOpts, ctx);

  const modules = entries.map((m) => relative(madgeConfig.baseDir, m));

  return {
    deps,
    pkMap: excludePKOutsideEntries(modules, deps, pkMap, true),
    modules,
  };
};

export const getFullDeps = async (
  entries: string[],
  opts: Omit<IOpts, 'collectKeys'> & { collectKeys?: IOpts['collectKeys'] },
  collectKeysOpts?: CollectKeysOpts
) => {
  const ctx: IContext = {
    deps: (await madge(entries, getMadgeConfig(opts.madgeConfig))).obj(),
    pkMap: {},
  };
  const statuses: FileStatus[] = Object.keys(ctx.deps).map((module, idx) => ({
    type: 'modified',
    from: module,
    lastModified: idx,
  }));

  return getDeps(
    statuses,
    entries,
    { ...opts, ignoreCollectDeps: true },
    ctx,
    collectKeysOpts
  );
};
