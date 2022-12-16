import { readFileSync } from 'fs';

import { Dictionary } from '../types';

export const defaultJsonFileParser = (jsonPath: string) => {
  return JSON.parse(
    readFileSync(jsonPath, { encoding: 'utf-8' })
  ) as Dictionary;
};
