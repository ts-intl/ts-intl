import { lstatSync, readdirSync } from 'fs';
import { resolve } from 'path';

import { getDependenciesByEntries } from './getDependenciesByEntries';
import { ExtractIntlKeysOpts, IOpts } from './types';

const getEntriesSync = (dirPath: string, rule = /\.tsx?$/) => {
  if (!lstatSync(dirPath).isDirectory())
    return rule.test(dirPath) ? [dirPath] : [];
  const res: string[] = [];
  readdirSync(dirPath).forEach((file) => {
    res.push(...getEntriesSync(resolve(dirPath, file)));
  });
  return res;
};

// const getEntries = async (dirPath: string, rule = /\.tsx?$/) => {
//   const isDir = (await stat(dirPath)).isDirectory();
//   if (!isDir) return rule.test(dirPath) ? [dirPath] : [];
//   const res: string[] = [];
//   (await readdir(dirPath)).forEach(async (file) => {
//     const child = await getEntries(resolve(dirPath, file), rule);
//     child.forEach((v) => res.push(v));
//   });
//   return res;
// };

export const getDependenciesFs = (
  entry: string,
  opts: Omit<IOpts, 'extractIntlKeys'> & {
    extractIntlKeys?: IOpts['extractIntlKeys'];
  },
  extractIntlKeysOpts?: ExtractIntlKeysOpts
) => {
  return getDependenciesByEntries(
    getEntriesSync(entry),
    opts,
    extractIntlKeysOpts
  );
};
