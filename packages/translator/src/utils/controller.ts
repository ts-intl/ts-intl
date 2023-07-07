import { Dictionary, DictionaryController } from '@ts-intl/shared';

import { ProjectConfig, TranslateNeeded } from '../types';

export const getControllers = (config: ProjectConfig) =>
  [config.basicLanguage, ...config.languages].map((locale) => ({
    controller: DictionaryController.getControllerFs({
      localePath: config.path,
      locale,
    }),
    locale,
  }));

export const extractMissingPairs = (
  config: ProjectConfig,
  controllers: ReturnType<typeof getControllers>
) => {
  const [base, ...others] = controllers;
  const missing: Record<string, TranslateNeeded[]> = Object.fromEntries(
    config.languages.map((locale) => [locale, []])
  );
  base.controller.traverse(
    (path, value) => {
      others.forEach(({ controller, locale }) => {
        const { msg, errorType } = controller.hasPathToLeaf(
          path,
          config.nsDivider,
          config.keyDivider
        );
        if (!errorType && msg) return;
        missing[locale].push({
          path,
          originalContent: value,
        });
      });
    },
    config.nsDivider,
    config.keyDivider
  );
  return missing;
};

export const getParentOfLeave = (dict: Dictionary, keys: string[]) => {
  let cur = dict;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const next = cur[keys[i]];
    if (!next || typeof next !== 'object') {
      throw new Error(`Invalid path: ${keys.slice(0, i + 1).join('.')}`);
    }
    cur = next;
  }
  return {
    parent: cur,
    key: keys[keys.length - 1],
  };
};

export const parsePath = (
  path: string,
  nsDivider: string,
  keyDivider: string
) => {
  const [ns, ...keyPath] = path.split(nsDivider);
  const keys = keyPath.join(nsDivider).split(keyDivider);
  return [ns, ...keys];
};
