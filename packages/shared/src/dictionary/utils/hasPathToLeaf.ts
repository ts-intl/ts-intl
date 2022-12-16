import { Dictionary, DictionaryParseErrorType } from '../../types';

type Configs = {
  dictionary: Dictionary;
  path: string;
  nsDivider: string;
  keyDivider: string;
};

export const hasPathToLeaf = ({
  dictionary,
  path,
  nsDivider,
  keyDivider,
}: Configs): {
  errorType?: DictionaryParseErrorType;
  msg?: string;
} => {
  let ns;
  let keys;
  for (let i = 0; i < path.length; i += 1) {
    if (path[i] === nsDivider) {
      ns = path.slice(0, i);
      keys = path.slice(i + 1).split(keyDivider);
      break;
    }
  }
  if (!keys) keys = path.split(keyDivider);
  if (!ns)
    return {
      errorType: DictionaryParseErrorType.MissingNamespace,
    };
  let child = dictionary[ns];
  if (typeof child !== 'object')
    return {
      errorType: DictionaryParseErrorType.MissingKey,
      msg: ns,
    };

  for (let i = 0; i < keys.length; i += 1) {
    if (typeof child === 'string' || child[keys[i]] === undefined) {
      return {
        errorType: DictionaryParseErrorType.MissingChild,
        msg: keys.slice(0, i + 1).join(keyDivider),
      };
    }
    child = child[keys[i]];
  }

  if (typeof child !== 'string')
    return { errorType: DictionaryParseErrorType.MissingValue };

  return { msg: child };
};
