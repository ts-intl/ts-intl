import { readFileSync } from 'fs';
import { resolve } from 'path';

import { collectKeys } from '../collectKeys';

const codeA = readFileSync(resolve(__dirname, './templates/a.tsx'), 'utf-8');

describe('collectKeys', () => {
  it('a', () => {
    const keys = collectKeys(codeA, {
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
