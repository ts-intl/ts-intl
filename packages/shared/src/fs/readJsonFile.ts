import { readFileSync } from 'fs';
import json5 from 'json5';

export const readJsonFile = (path: string) =>
  json5.parse(readFileSync(path, 'utf-8'));
