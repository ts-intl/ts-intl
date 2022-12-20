import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';

import { getDependenciesByEntries } from './getDependenciesByEntries';
import { ExtractIntlKeysOpts, IOpts } from './types';

const getEntries = async (dirPath: string, rule = /\.tsx?$/) => {
  if (!(await stat(dirPath)).isDirectory())
    return rule.test(dirPath) ? [dirPath] : [];
  const res: string[] = [];
  (await readdir(dirPath)).forEach(async (file) => {
    res.push(...(await getEntries(resolve(dirPath, file), rule)));
  });
  return res;
};

export const getDependenciesFs = async (
  entry: string,
  opts: Omit<IOpts, 'extractIntlKeys'> & {
    extractIntlKeys?: IOpts['extractIntlKeys'];
  },
  extractIntlKeysOpts?: ExtractIntlKeysOpts
) => {
  return getDependenciesByEntries(
    await getEntries(entry),
    opts,
    extractIntlKeysOpts
  );
};
