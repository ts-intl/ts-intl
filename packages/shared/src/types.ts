export type NSPath = (string | NSPath)[];

export type Dictionary = {
  [key: string]: string | Dictionary;
};

export type FlagDict = {
  [key: string]: true | FlagDict;
};

export enum DictionaryParseErrorType {
  MissingNamespace = 1,
  MissingKey = 2,
  MissingChild = 3,
  MissingValue = 4,
}

export type Reader<T> = (path: string, key?: string) => T;

export type ProjectConfig = {
  path: {
    base: string;
    dictionary: string;
    entry: string;
    cache: string;
  };

  locale: {
    basic: string;
    others: string[];
  };

  syntax: {
    nsDivider: string;
    keyDivider: string;
  };

  integration: {
    funcNamePattern: string;
    hookNamePattern: string;
    richNamePattern: string;
  };

  madgeConfig: {
    /**
     * Base directory to use instead of the default.
     *
     * @default undefined
     */
    baseDir?: string;

    /**
     * If shallow NPM modules should be included.
     *
     * @default false
     */
    includeNpm?: boolean;

    /**
     * Valid file extensions used to find files in directories.
     *
     * @default ['js']
     */
    fileExtensions?: string[];

    /**
     * An array of RegExp for excluding modules.
     *
     * @default undefined
     */
    excludeRegExp?: RegExp[];

    /**
     * RequireJS config for resolving aliased modules.
     *
     * @default undefined
     */
    requireConfig?: string;

    /**
     * Webpack config for resolving aliased modules.
     *
     * @default undefined
     */
    webpackConfig?: string;

    /**
     * TypeScript config for resolving aliased modules - Either a path to a tsconfig file or an object containing the config.
     *
     * @default undefined
     */
    tsConfig?: string | object;

    /**
     * Layout to use in the graph.
     *
     * @default 'dot'
     */
    layout?: string;

    /**
     * Sets the [direction](https://graphviz.gitlab.io/_pages/doc/info/attrs.html#d:rankdir) of the graph layout.
     *
     * @default 'LR'
     */
    rankdir?: 'TB' | 'LR' | 'BT' | 'RL';

    /**
     * Font name to use in the graph.
     *
     * @default 'Arial'
     */
    fontName?: string;

    /**
     * Font size to use in the graph.
     *
     * @default '14px'
     */
    fontSize?: string;

    /**
     * Background color for the graph.
     *
     * @default '#000000'
     */
    backgroundColor?: string;

    /**
     * A string specifying the [shape](https://graphviz.gitlab.io/_pages/doc/info/attrs.html#k:shape) of a node in the graph.
     *
     * @default 'box'
     */
    nodeShape?: string;

    /**
     * A string specifying the [style](https://graphviz.gitlab.io/_pages/doc/info/attrs.html#k:style) of a node in the graph.
     *
     * @default 'rounded'
     */
    nodeStyle?: string;

    /**
     * Default node color to use in the graph.
     *
     * @default '#c6c5fe'
     */
    nodeColor?: string;

    /**
     * Color to use for nodes with no dependencies.
     *
     * @default '#cfffac'
     */
    noDependencyColor?: string;

    /**
     * Color to use for circular dependencies.
     *
     * @default '#ff6c60'
     */
    cyclicNodeColor?: string;

    /**
     * Edge color to use in the graph.
     *
     * @default '#757575'
     */
    edgeColor?: string;

    /**
     * Custom Graphviz [options](https://graphviz.gitlab.io/_pages/doc/info/attrs.html).
     *
     * @default undefined
     */
    graphVizOptions?: object;

    /**
     * Custom Graphviz path.
     *
     * @default undefined
     */
    graphVizPath?: string;

    /**
     * Custom `detective` options for [dependency-tree](https://github.com/dependents/node-dependency-tree) and [precinct](https://github.com/dependents/node-precinct#usage).
     *
     * @default undefined
     */
    detectiveOptions?: object;

    /**
     * Function called with a dependency filepath (exclude a subtree by returning false).
     *
     * @default undefined
     */
    dependencyFilter?: (id: string) => boolean;
  };
};
