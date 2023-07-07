import { Dictionary, DictionaryParseErrorType, ProjectConfig } from '../types';

export const hasPathToLeaf = ({
  dictionary,
  path,
  nsDivider,
  keyDivider,
}: {
  dictionary: Dictionary;
  path: string;
} & ProjectConfig['syntax']): {
  errorType?: DictionaryParseErrorType;
  msg?: string;
} => {
  const nsIdx = path.indexOf(nsDivider);
  const ns = path.slice(0, nsIdx);
  const keys = path.slice(nsIdx + 1).split(keyDivider);
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
