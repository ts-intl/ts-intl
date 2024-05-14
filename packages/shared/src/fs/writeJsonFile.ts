import {
  writeFileWithDetection,
  writeFileWithDetectionSync,
} from './writeFileWithDetection';

export const writeJsonFile = (path: string, obj: object, override: boolean) =>
  writeFileWithDetection(path, JSON.stringify(obj, undefined, 2), override);

export const writeJsonFileSync = (
  path: string,
  obj: object,
  override: boolean,
) =>
  writeFileWithDetectionSync(path, JSON.stringify(obj, undefined, 2), override);
