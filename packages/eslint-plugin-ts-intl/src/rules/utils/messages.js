const { readFileSync, readdirSync, watch: _watch } = require('fs');
const { resolve, join, parse } = require('path');

// cache is useless because of singleton
// ignore cache when trigger fsWatcher
const defaultParseJsonFile = (jsonPath) => {
  return JSON.parse(readFileSync(jsonPath, { encoding: 'utf-8' }));
};

const getLocaleMessages = (
  fullPath,
  locale,
  parseJsonFile = defaultParseJsonFile
) => {
  try {
    const dirPath = resolve(fullPath, locale);
    return {
      isDir: true,
      path: dirPath,
      dict: readdirSync(dirPath).reduce((dict, filename) => {
        const { name, ext } = parse(filename);
        if (/^\.json$/.test(ext))
          dict[name] = parseJsonFile(join(dirPath, filename));
        return dict;
      }, {}),
    };
  } catch (err) {
    console.error(err, `resolve ${locale} folder failed`);
  }
  // lng.json
  try {
    const jsonPath = join(fullPath, `${locale}.json`);
    return {
      isDir: false,
      path: jsonPath,
      dict: parseJsonFile(jsonPath),
    };
  } catch (err) {
    console.error(err, `resolve ${locale}.json failed`);
  }
  return {};
};

class LocaleMessages {
  static singleton;

  static getSingleton(
    fullPath,
    locale,
    watchMode = !!process.env.VSCODE_PID, // watch only when run by vscode-eslint, command line should not watch which would cause eslint not exit
    parseJsonFile = defaultParseJsonFile
  ) {
    return (LocaleMessages.singleton =
      LocaleMessages.singleton ||
      new LocaleMessages(fullPath, locale, watchMode, parseJsonFile));
  }

  constructor(
    fullPath,
    locale,
    watchMode = false,
    parseJsonFile = defaultParseJsonFile
  ) {
    this.parseJsonFile = parseJsonFile;
    const { isDir, path, dict } = getLocaleMessages(
      fullPath,
      locale,
      parseJsonFile
    );
    this.dict = dict;
    this.isDir = isDir;
    this.path = path;
    this.fsWatcher = watchMode && this.watch();
  }

  watch = () => {
    return _watch(this.path, { recursive: true }, (eventType, filename) => {
      const { name, ext } = parse(filename);
      if (/^\.json$/.test(ext))
        this.resolveDict({
          [name]: this.parseJsonFile(
            this.isDir ? join(this.path, filename) : this.path
          ),
        });
    });
  };

  resolveDict = (newDict) => {
    if (this.isDir) {
      this.dict = {
        ...this.dict,
        ...newDict,
      };
    } else {
      this.dict = {
        ...newDict,
      };
    }
  };

  destroy = () => {
    this.fsWatcher && this.fsWatcher.close();
  };

  hasPath = (path, nsDivider, keyDivider) => {
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
        code: 1,
      };
    let child = this.dict[ns];
    if (typeof child !== 'object')
      return {
        code: 2,
        msg: ns,
      };

    for (let i = 0; i < keys.length; i += 1) {
      try {
        child = child[keys[i]];
        if (typeof child === 'undefined') throw 3;
      } catch (err) {
        return {
          code: 3,
          msg: keys.slice(0, i + 1).join(keyDivider),
        };
      }
    }

    if (typeof child !== 'string') return { code: 4 };

    return { code: 0, msg: child };
  };
}

module.exports = {
  LocaleMessages,
};
