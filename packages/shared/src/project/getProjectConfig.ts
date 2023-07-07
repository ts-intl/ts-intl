import { resolve } from 'path';

import { readJsonFile } from '../utils/readJsonFile';
import { getProjectConfigPaths } from './configFileNames';
import { getDefaultProjectConfig } from './defaultProjectConfig';
import { ProjectConfig } from './types';

export const getProjectConfigFs = (root = process.cwd()) =>
  getProjectConfig(root, readJsonFile(getProjectConfigPaths(root).project));

export const getProjectConfig = (
  root: string,
  originalConfig: unknown
): ProjectConfig => {
  const conf = getDefaultProjectConfig();
  if (!originalConfig || typeof originalConfig !== 'object') {
    throw new Error('No Project Config Found!');
  }
  if ('path' in originalConfig && typeof originalConfig.path === 'object') {
    conf.path = {
      ...conf.path,
      ...originalConfig.path,
    };
  }
  if ('locale' in originalConfig && typeof originalConfig.locale === 'object') {
    conf.locale = {
      ...conf.locale,
      ...originalConfig.locale,
    };
  }
  if ('syntax' in originalConfig && typeof originalConfig.syntax === 'object') {
    conf.syntax = {
      ...conf.syntax,
      ...originalConfig.syntax,
    };
  }

  if (
    'integration' in originalConfig &&
    typeof originalConfig.integration === 'object'
  ) {
    conf.integration = {
      ...conf.integration,
      ...originalConfig.integration,
    };
  }
  if (
    'madgeConfig' in originalConfig &&
    typeof originalConfig.madgeConfig === 'object'
  ) {
    conf.madgeConfig = {
      ...conf.madgeConfig,
      ...originalConfig.madgeConfig,
    };

    // conf.madgeConfig.excludeRegExp = conf.madgeConfig.excludeRegExp?.map(
    //   (regExp) => (typeof regExp === 'string' ? new RegExp(regExp) : regExp)
    // );
  }
  return resolveProjectPaths(root, conf);
};

const resolveProjectPaths = (root: string, conf: ProjectConfig) => {
  if (isRelativePath(conf.path.root)) {
    conf.path.root = resolve(root, conf.path.root);
  }
  if (isRelativePath(conf.path.dictionary)) {
    conf.path.dictionary = resolve(conf.path.root, conf.path.dictionary);
  }
  if (isRelativePath(conf.path.entry)) {
    conf.path.entry = resolve(conf.path.root, conf.path.entry);
  }
  if (isRelativePath(conf.path.cache)) {
    conf.path.cache = resolve(conf.path.root, conf.path.cache);
  }
  return conf;
};

const isRelativePath = (path: string) => !path.startsWith('/');
