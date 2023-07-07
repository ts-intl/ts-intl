import { Project } from '@ts-intl/shared';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const writeConf = async () => {
  const targetPath = Project.getConfigFilePaths().eslint;
  if (existsSync(targetPath)) return;
  await writeFile(
    targetPath,
    await readFile(
      join(__dirname, '../templates/ts-intl.eslintrc.js'),
      'utf-8'
    ),
    'utf-8'
  );
};

writeConf();
