import { buildNSPathByKeys, buildTrieByNSPath } from './index';

const keys = [
  'common.a',
  'common.b.a',
  'common.b.c.d',
  'common.b.c.e',
  'others.a.b.c',
];

describe('i18n-utils', () => {
  it('buildTrieByNSPath', () => {
    const trie = buildTrieByNSPath(['1', ['2', ['3'], '4']]);
    expect(trie.get('1')?.name).toBe('1');
    expect(trie.get('1')?.isLeaf).toBe(false);
    expect(trie.get('1')?.get('2')?.isLeaf).toBe(false);
    expect(trie.get('1')?.get('4')?.isLeaf).toBe(true);
    expect(trie.get('1')?.get('2')?.get('3')?.isLeaf).toBe(true);
  });

  it('buildNSPathByKeys', () => {
    expect(buildNSPathByKeys(keys, '.', '.')).toEqual(
      expect.arrayContaining([
        'common',
        ['a', 'b', ['a', 'c', ['d', 'e']]],
        'others',
        ['a', ['b', ['c']]],
      ])
    );
  });
});
