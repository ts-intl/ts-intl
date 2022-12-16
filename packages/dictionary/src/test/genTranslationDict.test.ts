import { resolve } from 'path';

import {
  genTranslationDict,
  genTranslationDictFs,
} from '../genTranslationDict';
import { buildTrieByNSPath } from '../utils';
import base from './json/en.json';
import target from './json/ko.json';

const jsonPath = resolve(__dirname, './json');
const folderPath = resolve(__dirname, './folder');

describe('i18n-utils', () => {
  it('genTranslationDict', () => {
    expect(
      JSON.stringify(
        genTranslationDict(
          target,
          base,
          'en',
          buildTrieByNSPath(['a', ['c', 'g']])
        )
      )
    ).toBe('{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}');
    expect(
      JSON.stringify(
        genTranslationDict(
          target,
          base,
          'en',
          buildTrieByNSPath(['a', ['c', ['d'], 'g']])
        )
      )
    ).toBe('{"a":{"c":{"d":"dd"},"g":"g"}}');
  });

  it('genTranslationDictFs', async () => {
    const dict = await genTranslationDictFs({
      root: jsonPath,
      lng: 'ko',
      fallbackLng: 'en',
      ns: {
        include: ['a'],
        exclude: ['a', ['b']],
      },
    });
    expect(JSON.stringify(dict)).toBe('{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}'); // exclude a.b
  });

  it('getTranslationDictFolder', async () => {
    const dict1 = await genTranslationDictFs({
      root: folderPath,
      lng: 'ko',
      fallbackLng: 'en',
      ns: {
        include: ['a'],
        exclude: ['a', ['b']],
      },
    });
    expect(JSON.stringify(dict1)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}'
    ); // exclude a.b

    const dict2 = await genTranslationDictFs({
      root: folderPath,
      lng: 'ko',
      fallbackLng: 'en',
      ns: {
        include: ['a', 'b'],
        exclude: ['a', ['b'], 'b', ['x']],
      },
    });
    expect(JSON.stringify(dict2)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"},"b":{"z":"zz"}}'
    );

    const dict3 = await genTranslationDictFs({
      root: folderPath,
      lng: 'ko',
      fallbackLng: 'en',
      ns: {
        include: ['a', 'b'],
        exclude: ['a', ['b'], 'b', ['z']],
      },
    });
    expect(JSON.stringify(dict3)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"},"b":{"x":{"y":"y"}}}'
    );
  });
});
