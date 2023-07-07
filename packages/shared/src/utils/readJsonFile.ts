import { readFileSync } from 'fs';

export const readJsonFile = (fullPath: string) =>
  JSON.parse(readFileSync(fullPath, 'utf-8'));
