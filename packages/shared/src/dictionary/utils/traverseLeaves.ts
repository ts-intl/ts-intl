import { Dictionary } from '../../types';

type Configs = {
  dictionary: Dictionary;
  nsDivider: string;
  keyDivider: string;
  cb: (path: string, value: string) => void;
};

export const traverseLeaves = ({
  dictionary,
  nsDivider,
  keyDivider,
  cb,
}: Configs) => {
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
