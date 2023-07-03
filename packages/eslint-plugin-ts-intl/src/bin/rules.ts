import {
  configFileNames,
  getProjectConfigFs,
  getProjectConfigPaths,
} from '@ts-intl/shared';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const configTemplatePath = join(
  join(__dirname, '../templates'),
  configFileNames.eslint
);

const writeConf = async () => {
  const projectConfig = getProjectConfigFs();
  const targetPath = getProjectConfigPaths(projectConfig.path.root).eslint;
  if (existsSync(targetPath)) return;
  await writeFile(
    targetPath,
    await readFile(configTemplatePath, 'utf-8'),
    'utf-8'
  );
};

writeConf();
