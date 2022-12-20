import madge from 'madge';

import { getDependencies } from './getDependencies';
import { ExtractIntlKeysOpts, FileStatus, IContext, IOpts } from './types';
import { mergeMadgeConfig } from './utils';

export const getDependenciesByEntries = async (
  entries: string[],
  opts: Omit<IOpts, 'extractIntlKeys'> & {
    extractIntlKeys?: IOpts['extractIntlKeys'];
  },
  extractIntlKeysOpts?: ExtractIntlKeysOpts
) => {
  const ctx: IContext = {
    graph: (await madge(entries, mergeMadgeConfig(opts.madgeConfig))).obj(),
    pathIntlKeysMap: {},
  };
  const statuses: FileStatus[] = Object.keys(ctx.graph).map((module, idx) => ({
    type: 'modified',
    from: module,
    lastModified: idx,
  }));

  return getDependencies(
    statuses,
    entries,
    { ...opts, ignoreCollectDeps: true },
    ctx,
    extractIntlKeysOpts
  );
};
