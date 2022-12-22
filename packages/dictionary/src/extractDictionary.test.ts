import { extractDictionary } from './extractDictionary';
import base from './test/json/en.json';
import target from './test/json/ko.json';

describe('extractDictionary', () => {
  it('include', () => {
    expect(
      JSON.stringify(extractDictionary(target, base, ['a', ['c', 'g']]))
    ).toBe('{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}');
    expect(
      JSON.stringify(extractDictionary(target, base, ['a', ['c', ['d'], 'g']]))
    ).toBe('{"a":{"c":{"d":"dd"},"g":"g"}}');
  });

  it('exclude', () => {
    expect(
      JSON.stringify(
        extractDictionary(target, base, ['a', ['c', 'g'], 'f'], ['f'])
      )
    ).toBe('{"a":{"c":{"d":"dd","e":"e"},"g":"g"}}');
  });
});
