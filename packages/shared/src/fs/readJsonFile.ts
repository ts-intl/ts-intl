import { readFileSync } from 'fs';

export const readJsonFile = (path: string) =>
  JSON.parse(readFileSync(path, 'utf-8'));
