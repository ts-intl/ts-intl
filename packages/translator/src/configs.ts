import { readJsonFile } from '@ts-intl/shared';
import { join } from 'path';

import { ProjectConfig } from './types';

export const ROOT_PATH = process.cwd();
export const CONFIG_PATH = 'ts-intl-translator.config.json';

export const SHARED_FLOW_PATH = 'translator-shared.yml';

export const DEFAULT_FLOW_PATH = 'translator-flow.yml';

export const readConfig = (): ProjectConfig =>
  readJsonFile(join(ROOT_PATH, CONFIG_PATH)) ?? {};
