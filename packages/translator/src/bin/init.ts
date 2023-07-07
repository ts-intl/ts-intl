import { Project } from '@ts-intl/shared';
import { existsSync } from 'fs';
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { join, relative } from 'path';

const SHARED_FLOW_PATH = 'translator-shared.yml';
const DEFAULT_FLOW_PATH = 'translator-flow.yml';

const templatePath = join(__dirname, '../templates');
const flowTemplatePath = join(templatePath, 'flow.yml');
const sharedFlowTemplatePath = join(templatePath, 'shared.yml');

const flowAbsolutePath = join(process.cwd(), '.github/workflows');

const init = async () => {
  let path: string | undefined;
  try {
    path = new Project().projectConfig.path.dictionary;
  } catch (err) {
    //
  }
  if (!path) {
    throw new Error('Please init project config file first: npx ts-intl-init');
  }
  return writeFlow(relative(process.cwd(), path));
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
