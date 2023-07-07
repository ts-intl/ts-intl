import { ProjectConfig } from '@ts-intl/shared';

export type DepsGraph = Record<string, string[]>;
export type PathIntlKeysMap = Record<string, string[]>;

interface IFileStatus<T extends string> {
  type: T;
  from: string;
  to?: string;
  lastModified: Date | number | string; // for sort
}

export type Modified = IFileStatus<'modified'>;
export type Deleted = IFileStatus<'deleted'>;
export type NewFile = IFileStatus<'new file'>;
export type Renamed = Required<IFileStatus<'renamed'>>;

export type FileStatus = Modified | Deleted | NewFile | Renamed;

export interface IOpts {
  extractIntlKeys: (module: string) => string[] | Promise<string[]>;
  ignoreCollectDeps?: boolean;
  madgeConfig: ProjectConfig['madgeConfig'] & {
    baseDir: string;
  };
}

export interface IContext {
  graph: DepsGraph;
  pathIntlKeysMap: PathIntlKeysMap;
}

export interface IAction<S = FileStatus> {
  (status: S, opts: IOpts, ctx: IContext): Promise<IContext>;
}

export type ExtractIntlKeysOpts = {
  argIdx?: number;
} & Partial<ProjectConfig['integration']>;

export type GetDependenciesRes = {
  graph: DepsGraph;
  pathIntlKeysMap: PathIntlKeysMap;
  modules: string[];
};

export type PipeDependenciesRes<T> = (res: GetDependenciesRes) => T;
