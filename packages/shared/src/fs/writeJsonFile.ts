import json5 from 'json5';

import { writeFileWithDetection } from './writeFileWithDetection';

export const writeJsonFile = (path: string, obj: object, override: boolean) =>
  writeFileWithDetection(
    path,
    json5.stringify(obj, {
      space: 2,
      quote: '"',
    }),
    override
  );
