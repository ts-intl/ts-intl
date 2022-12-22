import { readFileSync } from 'fs';
import { resolve } from 'path';

import { extractIntlKeysFromCode } from './extractIntlKeysFromCode';

const codeA = readFileSync(resolve(__dirname, './test/a.tsx'), 'utf-8');

describe('extractIntlKeys', () => {
  it('template a', () => {
    const keys = extractIntlKeysFromCode(codeA, {
      funcNamePattern: '^(t|\\$t)$',
      hookNamePattern: '^useTranslations$',
      richNamePattern: '^rich$',
    });
    expect(keys).toEqual(
      expect.arrayContaining([
        'includes.a',
        'includes.b',
        'includes.c',
        'includes.d',
        'includes.e',
        'includes.f',
        'includes.g',
        'includes.h',
        'includes.i',
      ])
    );
  });
});
