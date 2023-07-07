import { resolve } from 'path';

import { extractDictionaryFs } from './extractDictionaryFs';

const jsonPath = resolve(__dirname, './test/json');
const folderPath = resolve(__dirname, './test/folder');

describe('extractDictionaryFs', () => {
  it('json', () => {
    const dict = extractDictionaryFs({
      localePath: jsonPath,
      locale: 'ko',
      basicLocale: 'en',
      include: ['a'],
      exclude: ['a', ['b']],
    });
    expect(JSON.stringify(dict)).toBe('{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}'); // exclude a.b
  });

  it('folder', () => {
    const dict1 = extractDictionaryFs({
      localePath: folderPath,
      locale: 'ko',
      basicLocale: 'en',
      include: ['a'],
      exclude: ['a', ['b']],
    });
    expect(JSON.stringify(dict1)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}'
    ); // exclude a.b

    const dict2 = extractDictionaryFs({
      localePath: folderPath,
      locale: 'ko',
      basicLocale: 'en',
      include: ['a', 'b'],
      exclude: ['a', ['b'], 'b', ['x']],
    });
    expect(JSON.stringify(dict2)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"},"b":{"z":"zz"}}'
    );

    const dict3 = extractDictionaryFs({
      localePath: folderPath,
      locale: 'ko',
      basicLocale: 'en',
      include: ['a', 'b'],
      exclude: ['a', ['b'], 'b', ['z']],
    });
    expect(JSON.stringify(dict3)).toBe(
      '{"a":{"c":{"d":"dd","e":"e"},"g":"g"},"b":{"x":{"y":"y"}}}'
    );
  });
});
