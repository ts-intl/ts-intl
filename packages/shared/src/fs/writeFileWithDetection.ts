import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';

export const writeFileWithDetection = async (
  path: string,
  content: string,
  override: boolean
) => {
  if (override && existsSync(path)) {
    console.warn(`File ${path} already exists, ignore.`);
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  return writeFile(path, content, 'utf-8');
};
