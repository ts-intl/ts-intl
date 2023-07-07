import { join, resolve } from 'path';

import { readJsonFile } from '../fs';
import { ProjectConfig, Reader } from '../types';
import { FILE_NAMES } from './constants';
import { getDefaultProjectConfig } from './defaultProjectConfig';

export class Project {
  static singleton?: Project;
  static getSingleton(root?: string, reader?: Reader<ProjectConfig>) {
    return (Project.singleton = Project.singleton ?? new Project(root, reader));
  }

  public root: string;
  public configFilePaths: {
    project: string;
    eslint: string;
  };
  public projectConfig: ProjectConfig;
  public cacheFilePaths: {
    graph: string;
    keysOfPaths: string;
    keysOfEntries: string;
    usedKeys: string;
  };

  constructor(root?: string, reader?: Reader<ProjectConfig>) {
    this.root = root ?? process.cwd();

    this.configFilePaths = Project.getConfigFilePaths();

    this.projectConfig = Project.getProjectConfig(
      this.root,
      (reader ?? readJsonFile)(this.configFilePaths.project)
    );

    this.cacheFilePaths = Project.getCacheFilePaths(
      this.projectConfig.path.cache
    );
  }

  static getConfigFilePaths(root = process.cwd()) {
    return {
      project: join(root, FILE_NAMES.project),
      eslint: join(root, FILE_NAMES.eslint),
    };
  }
  static getProjectConfig(
    root?: string,
    projectConfig?: unknown
  ): ProjectConfig {
    root = root ?? process.cwd();
    const conf = getDefaultProjectConfig();
    if (!projectConfig || typeof projectConfig !== 'object') {
      return resolveProjectPaths(root, conf);
    }
    if ('path' in projectConfig && typeof projectConfig.path === 'object') {
      conf.path = {
        ...conf.path,
        ...projectConfig.path,
      };
    }
    if ('locale' in projectConfig && typeof projectConfig.locale === 'object') {
      conf.locale = {
        ...conf.locale,
        ...projectConfig.locale,
      };
    }
    if ('syntax' in projectConfig && typeof projectConfig.syntax === 'object') {
      conf.syntax = {
        ...conf.syntax,
        ...projectConfig.syntax,
      };
    }

    if (
      'integration' in projectConfig &&
      typeof projectConfig.integration === 'object'
    ) {
      conf.integration = {
        ...conf.integration,
        ...projectConfig.integration,
      };
    }
    if (
      'madgeConfig' in projectConfig &&
      typeof projectConfig.madgeConfig === 'object'
    ) {
      conf.madgeConfig = {
        ...conf.madgeConfig,
        ...projectConfig.madgeConfig,
      };
    }
    return resolveProjectPaths(root, conf);
  }

  static getCacheFilePaths(cacheDir: string) {
    return {
      graph: join(cacheDir, FILE_NAMES.cacheGraph),
      keysOfPaths: join(cacheDir, FILE_NAMES.cacheKeysOfPaths),
      keysOfEntries: join(cacheDir, FILE_NAMES.cacheKeysOfEntries),
      usedKeys: join(cacheDir, FILE_NAMES.cacheUsedKeys),
    };
  }
}

const resolveProjectPaths = (root: string, conf: ProjectConfig) => {
  if (isRelativePath(conf.path.base)) {
    conf.path.base = resolve(root, conf.path.base);
  }
  const others: Exclude<keyof ProjectConfig['path'], 'base'>[] = [
    'dictionary',
    'entry',
    'cache',
  ];
  others.forEach((key) => {
    if (isRelativePath(conf.path[key])) {
      conf.path[key] = resolve(conf.path.base, conf.path[key]);
    }
  });
  return conf;
};

const isRelativePath = (path: string) => !path.startsWith('/');
