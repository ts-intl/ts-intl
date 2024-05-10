import { type UrlObject } from 'url';

import { IntlUtilsBase } from './base';
import type { IntlInternalUrl } from './types';

export class IntlUtilsBrowser extends IntlUtilsBase {
  enhanceRouter = <
    Opts extends {
      locale?: string;
    },
    T extends IRouter<Opts>
  >(
    router: T
  ): Omit<T, 'push' | 'replace'> & {
    push(url: IntlInternalUrl, options?: Opts): Promise<boolean>;
    replace(url: IntlInternalUrl, options?: Opts): Promise<boolean>;
  } => {
    const optimized = this.optimizeRouterPath(router.asPath, router.pathname);
    const genAction =
      (action: 'push' | 'replace') =>
      (url: IntlInternalUrl, options?: Opts) => {
        return router[action](
          this.revertRouterUrl(url, options?.locale ?? optimized.locale),
          undefined,
          options
        );
      };
    return {
      ...router,
      /**
       * should not include locale/lang in the pathname or asPath
       * @see https://nextjs.org/docs/api-reference/next/router#router-object
       */
      ...optimized,
      locales: this.languages,
      push: genAction('push'),
      replace: genAction('replace'),
    };
  };

  revertRouterUrl = (url: IntlInternalUrl, locale?: string) => {
    if (!isInternalUrl(url)) return url;
    const originPathname = getPathnameFromUrl(url);
    const parsedUrl: UrlObject = {};
    parsedUrl.query = typeof url !== 'string' ? { ...url.query } : {};
    if (locale !== this.config.defaultLanguage)
      parsedUrl.query[this.config.languageParamName] = locale;
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    else delete parsedUrl.query[this.config.languageParamName];
    parsedUrl.pathname = this.revertRouterPathname(originPathname, locale);
    return parsedUrl;
  };

  private revertRouterPathname = (pathname: string, locale?: string) => {
    if (!this.isLanguageValid(locale)) locale = this.config.defaultLanguage;
    if (locale === this.config.defaultLanguage) return pathname;
    return `/[${this.config.languageParamName}]${pathname.replace(/\/$/, '')}`;
  };

  private optimizeRouterPath = (asPath: string, pathname: string) => {
    const slug = pathname.split('/')[1];
    if (slug === `[${this.config.languageParamName}]`) {
      const locale = asPath.split('/')[1];
      return {
        locale,
        asPath: asPath.replace(`/${locale}`, ''),
        pathname: pathname.replace(`/${slug}`, ''),
      };
    }
    return {
      locale: this.config.defaultLanguage,
      asPath,
      pathname,
    };
  };
}

const isInternalUrl = (url: IntlInternalUrl) => {
  if (typeof url === 'string') return url.startsWith('/');
  if (!url.pathname) return false;
  return url.pathname.startsWith('/');
};

const getPathnameFromUrl = (url: IntlInternalUrl) => {
  return typeof url === 'string' ? url : url.pathname;
};

type Url = UrlObject | string;

interface IRouter<
  Opts extends {
    locale?: string;
  }
> {
  pathname: string;
  asPath: string;

  locale?: string;
  locales?: string[];

  push(url: Url, as?: Url, options?: Opts): Promise<boolean>;
  replace(url: Url, as?: Url, options?: Opts): Promise<boolean>;
}
