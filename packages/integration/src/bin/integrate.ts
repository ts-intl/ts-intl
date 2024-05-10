import {
  Project,
  writeFileWithDetection,
  writeJsonFile,
} from '@ts-intl/shared';
import { readFile } from 'fs/promises';
import { join } from 'path';

writeJsonFile(
  Project.getConfigFilePaths().project,
  Project.getDefaultProjectConfig(),
  false,
);

const writeConf = async () =>
  writeFileWithDetection(
    Project.getConfigFilePaths().eslint,
    await readFile(
      join(__dirname, '../templates/ts-intl.eslintrc.js'),
      'utf-8',
    ),
    false,
  );

writeJsonFile(
  Project.getConfigFilePaths().project,
  Project.getDefaultProjectConfig(),
  false,
).then(writeConf);
