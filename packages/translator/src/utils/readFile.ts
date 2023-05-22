import { readFileSync } from 'fs';

export const readJsonFile = (fullPath: string) => {
  try {
    return JSON.parse(readFileSync(fullPath, 'utf-8') || '{}');
  } catch (err) {
    //
  }
};
