import { FlagDict, NSPath } from '../types';

export class Trie {
  childrenNameMap: Map<string, Trie> = new Map();
  constructor(public name = '', public parent?: Trie) {}
  get(name: string) {
    return this.childrenNameMap.get(name);
  }
  add(name: string) {
    if (this.childrenNameMap.has(name)) return;
    this.childrenNameMap.set(name, new Trie(name, this));
  }
  remove(name: string) {
    if (!this.childrenNameMap.has(name)) return;
    this.childrenNameMap.delete(name);
  }
  get isLeaf() {
    return !this.childrenNameMap.size;
  }
}

export const buildTrieByNSPath = (nsPath: NSPath = [], parent = new Trie()) => {
  nsPath.forEach((ns, i) =>
    typeof ns === 'string'
      ? parent.add(ns)
      : buildTrieByNSPath(ns, parent.get(nsPath[i - 1] as string) || parent)
  );
  return parent;
};

export const buildNSPathByKeys = (
  ...args: Parameters<typeof buildFlagDictByKeys>
): NSPath => {
  return buildNSPathByFlagDict(buildFlagDictByKeys(...args));
};

export const buildNSPathByFlagDict = (dict: FlagDict): NSPath => {
  const ns: NSPath = [];
  const stack = [ns];

  const dfs = (cur = dict) => {
    Object.entries(cur).forEach(([key, child]) => {
      stack[stack.length - 1].push(key);
      if (typeof child === 'object') {
        const next: NSPath = [];
        stack[stack.length - 1].push(next);
        stack.push(next);
        dfs(child);
        stack.pop();
      }
    });
  };
  dfs();

  return ns;
};

export const buildFlagDictByKeys = (
  keys: string[],
  nsDivider: string,
  keyDivider: string
): FlagDict => {
  const dict: FlagDict = {};
  keys.forEach((key) => {
    const paths = parseKeyToPaths(key, nsDivider, keyDivider);
    let t = dict;
    paths.forEach((curKey, i) => {
      if (i === paths.length - 1) {
        t[curKey] = true;
      } else {
        const next = t[curKey] || {};
        t[curKey] = next;
        if (typeof next === 'object') {
          t = next;
        }
      }
    });
  });
  return dict;
};

const parseKeyToPaths = (
  key: string,
  nsDivider: string,
  keyDivider: string
): string[] => {
  const paths: string[] = [];
  for (let i = 0; i < key.length; i += 1) {
    if (key[i] === nsDivider) {
      paths.push(key.slice(0, i));
      paths.push(...key.slice(i + 1).split(keyDivider));
      break;
    }
  }
  return paths;
};
