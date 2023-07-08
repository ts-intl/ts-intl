import { Project, writeFileWithDetection } from '@ts-intl/shared';
import { readFile } from 'fs/promises';
import { join } from 'path';

const writeConf = async () =>
  writeFileWithDetection(
    Project.getConfigFilePaths().eslint,
    await readFile(
      join(__dirname, '../templates/ts-intl.eslintrc.js'),
      'utf-8'
    ),
    false
  );

writeConf();
