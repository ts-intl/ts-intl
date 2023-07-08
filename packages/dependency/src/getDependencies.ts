import { readFile } from 'fs/promises';
import { relative, resolve } from 'path';

import { applyActions } from './actions';
import { extractIntlKeysFromCode as defaultCollectKeys } from './compiler/extractIntlKeysFromCode';
import {
  ExtractIntlKeysOpts,
  FileStatus,
  GetDependenciesRes,
  IContext,
  IOpts,
} from './types';
import { extractPathIntlKeysMap, mergeMadgeConfig } from './utils';

export const getDependencies = async (
  statuses: FileStatus[],
  entries: string[],
  opts: Omit<IOpts, 'extractIntlKeys'> & {
    extractIntlKeys?: IOpts['extractIntlKeys'];
  },
  ctx: IContext,
  extractIntlKeysOpts?: ExtractIntlKeysOpts
): Promise<GetDependenciesRes> => {
  const { madgeConfig, extractIntlKeys, ...rest } = opts;

  const mergedOpts: IOpts = {
    ...rest,
    madgeConfig: mergeMadgeConfig(madgeConfig),
    extractIntlKeys:
      extractIntlKeys ??
      (async (module: string) =>
        defaultCollectKeys(
          await readFile(resolve(opts.madgeConfig.baseDir, module), 'utf-8'),
          extractIntlKeysOpts ?? { funcNamePattern: '' }
        )),
  };

  const { graph, pathIntlKeysMap } = await applyActions(
    statuses,
    mergedOpts,
    ctx
  );

  const modules = entries.map((m) => relative(madgeConfig.baseDir, m));

  return {
    graph,
    pathIntlKeysMap: extractPathIntlKeysMap(
      modules,
      graph,
      pathIntlKeysMap,
      true
    ),
    modules,
  };
};
