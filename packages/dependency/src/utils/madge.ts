import { DepsGraph, MadgeConfig } from '../types';

export const offsprings = (
  id: string,
  graph: DepsGraph,
  visit: Record<string, boolean> = {}
) => {
  const res: string[] = [];
  (graph[id] || []).forEach((dep) => {
    if (visit[dep]) return;
    visit[dep] = true;
    res.push(dep);
    res.push(...offsprings(dep, graph, visit));
  });
  return res;
};

export const mergeMadgeConfig = (config: MadgeConfig) => {
  const tsConfig =
    typeof config.tsConfig === 'object'
      ? JSON.parse(JSON.stringify(config.tsConfig))
      : {};
  tsConfig.compilerOptions = {
    ...tsConfig.compilerOptions,
    moduleResolution: 'Node', // must provide to solve import like import * from './aDir', which should import ./aDir/index.(js|ts)x?
    esModuleInterop: true,
    baseUrl: config.baseDir,
  };
  return {
    fileExtensions: ['.ts', '.tsx'],
    detectiveOptions: {
      noTypeDefinitions: true,
      ts: {
        skipTypeImports: true,
        // mixedImports: true,
      },
    },
    // overwrite above
    ...config,
    // high priority
    tsConfig,
  };
};
