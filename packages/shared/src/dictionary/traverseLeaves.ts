import { Dictionary, ProjectConfig } from '../types';

export const traverseLeaves = ({
  dictionary,
  cb,
  nsDivider,
  keyDivider,
}: {
  dictionary: Dictionary;
  cb: (path: string, value: string) => void;
} & ProjectConfig['syntax']) => {
  const paths: string[] = [];
  const getPath = () => {
    const [ns, ...res] = paths;
    if (!ns) return '';
    if (!res.length) return ns;
    return ns + nsDivider + res.join(keyDivider);
  };
  const dfs = (node: Dictionary | string = dictionary) => {
    if (typeof node === 'string') {
      cb(getPath(), node);
      return;
    }
    Object.entries(node).forEach(([key, next]) => {
      paths.push(key);
      dfs(next);
      paths.pop();
    });
  };
  dfs();
};
