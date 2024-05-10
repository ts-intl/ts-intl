export const getPatternByArr = (
  arr: string[],
  custom?: string[],
  not = false,
) => {
  arr = custom ? [...arr, ...custom] : arr;
  return not ? `.*(?<!(${arr.join('|')}))$` : `^(${arr.join('|')})$`;
};

export const COMMON_IGNORE = '[a-zA-Z0-9_]*_raw';

export const ignoreFiles = [
  '\\.test\\.tsx?', // test
  '\\/stories', // stories

  'getServerSideProps\\.ts',
  '__sitemap',
  'SEO\\.tsx',
  'SEOTemplate\\.tsx',
];

export const matchedPattern = '[a-zA-Z]{2,}'; // at least 2 consecutive english letter

export const matchedJSXAttrs = [
  'label',
  'text',
  'title',
  'tips?',
  'placeholder',
  'description',
  'alt',
  '(!class)name',
];

export const ignoreCallNames = [
  'require',
  'fetch',
  'toLocaleString',
  'scrollTo',
  'addEventListener',
  'removeEventListener',
  'getOwnPropertyDescriptor',

  'useSWR',
  'updateFilter',
  'uniqueId',
  'scrollIntoView',
  'useQuery',
  COMMON_IGNORE,
];

export const ignoreCSSProperties = [
  'position|color|height|width|display|whiteSpace|alignItems|size|padding|base|md|cursor|variant|textDecoration',
  'variants',
];

export const ignoreCustomProperties = ['key', 'id', 'status', COMMON_IGNORE];

export const ignoreIndexNames = [COMMON_IGNORE];

export const ignoreCSSTexts = [
  'base|sm|md|xl|lg', // breakpoint
  '([0-9]+|\\$\\{\\})(px|vh|vw|em)', // unit
  '#[0-9a-fA-F]{3,6}',
  '[0-9a-fA-F]+\\!important',
];

export const ignoreReservedWords = [
  'ERC-?(20|721|1155)', // protocol
  '0x[0-9a-zA-Z]{40}', // address
];

export const ignoreUrlPatterns = [
  '([-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,20}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*))', // url
  'https?:\\/\\/.*', // protocol,
  'localhost(:[0-9]{4})?', // localhost
  '([^ /]+\\/)+', // path, collections/[slug]
  '[^ /]*(\\/[^ /]+)+\\/?', // path, /collections, collections/[slug]/[chain]
];
