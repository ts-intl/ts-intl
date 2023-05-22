import { existsSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import {
  CONFIG_PATH,
  DEFAULT_FLOW_PATH,
  ROOT_PATH,
  SHARED_FLOW_PATH,
} from '../configs';
import { parseArgv } from './parseArgv';

const templatePath = join(__dirname, '../templates');
const configTemplatePath = join(templatePath, 'config.json');
const flowTemplatePath = join(templatePath, 'flow.yml');
const sharedFlowTemplatePath = join(templatePath, 'shared.yml');

const configAbsolutePath = join(ROOT_PATH, CONFIG_PATH);
const flowAbsolutePath = join(ROOT_PATH, '.github/workflows');

const init = async () => {
  const { path } = parseArgv();
  if (!path) {
    throw new Error('Locale path is required');
  }
  return Promise.all([writeConf(path), writeFlow(path)]);
};

const writeConf = async (localPath: string) => {
  if (existsSync(configAbsolutePath)) return;
  await writeFile(
    configAbsolutePath,
    (
      await readFile(configTemplatePath, 'utf-8')
    ).replace(/\[PATH\]/g, localPath),
    'utf-8'
  );
};

const writeFlow = async (localPath: string) => {
  await mkdir(flowAbsolutePath, { recursive: true });
  const sharedFlowPath = join(flowAbsolutePath, SHARED_FLOW_PATH);
  if (!existsSync(sharedFlowPath)) {
    await copyFile(sharedFlowTemplatePath, sharedFlowPath);
  }
  const defaultFlowPath = join(flowAbsolutePath, DEFAULT_FLOW_PATH);
  if (!existsSync(defaultFlowPath)) {
    await writeFile(
      defaultFlowPath,
      (
        await readFile(flowTemplatePath, 'utf-8')
      ).replace(/\[PATH\]/g, localPath),
      'utf-8'
    );
  }
};

init();
