import type { MadgeConfig as OriginMadgeConfig } from 'madge';

export type DepsGraph = Record<string, string[]>;
export type PathKeysMap = Record<string, string[]>;

export type MadgeConfig = Omit<OriginMadgeConfig, 'baseDir'> & {
  baseDir: string;
};

export interface IFileStatus<T extends string> {
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
  collectKeys: (module: string) => string[] | Promise<string[]>;
  ignoreCollectDeps?: boolean;
  madgeConfig: MadgeConfig;
}

export interface IContext {
  deps: DepsGraph;
  pkMap: PathKeysMap;
}

export interface IAction<S = FileStatus> {
  (status: S, opts: IOpts, ctx: IContext): Promise<IContext>;
}
