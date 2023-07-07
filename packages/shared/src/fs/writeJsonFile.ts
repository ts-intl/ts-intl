import { promises } from 'fs';
import { dirname } from 'path';

export const writeJsonFile = async (path: string, obj: object) => {
  const { mkdir, writeFile } = promises;
  await mkdir(dirname(path), { recursive: true });
  return writeFile(path, JSON.stringify(obj), {
    encoding: 'utf-8',
  });
};
