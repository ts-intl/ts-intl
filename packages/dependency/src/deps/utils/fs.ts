import { lstatSync, readdirSync } from 'fs';
import { resolve } from 'path';

export const collectFilePaths = (dirPath: string) => {
  if (!lstatSync(dirPath).isDirectory()) return [dirPath];
  const res: string[] = [];
  readdirSync(dirPath).forEach((file) => {
    res.push(...collectFilePaths(resolve(dirPath, file)));
  });
  return res;
};
