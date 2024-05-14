import { DictionaryController, Project, readJsonFile } from '@ts-intl/shared';

const { projectConfig, cacheFilePaths } = new Project();

const getUnusedKeys = () => {
  const used = new Set(readJsonFile(cacheFilePaths.usedKeys));
  const unused: string[] = [];
  DictionaryController.getControllerFs({
    localePath: projectConfig.path.dictionary,
    locale: projectConfig.locale.basic,
  }).traverse(
    (path) => !used.has(path) && unused.push(path),
    projectConfig.syntax.nsDivider,
    projectConfig.syntax.keyDivider,
  );
  return unused;
};

console.info(getUnusedKeys());
