import { IntlUtilsBase } from './base';
import type { WithI18nDepsOpts } from './withI18nDeps';
import { withI18nDeps } from './withI18nDeps';

export class IntlUtilsServer extends IntlUtilsBase {
  getStaticPaths = async (): Promise<{
    paths: { params: Record<string, string> }[];
    fallback: boolean;
  }> => ({
    fallback: false,
    paths: this.languages.map((language) => ({
      params: {
        [this.config.languageParamName]: language,
      },
    })),
  });

  /**
   * getStaticProps middleware
   * @param ctx
   * @returns
   */
  withI18nDeps = (
    props: Omit<WithI18nDepsOpts, 'defaultLanguage'>,
    mode: 'ssg' | 'ssr' = 'ssg',
  ) => {
    const middleware = withI18nDeps({
      ...props,
      defaultLanguage: this.config.defaultLanguage,
    });
    return (ctx: {
      params?: Record<string, string | string[] | undefined>;
      locale?: string;
    }) => {
      const localeOfCtx =
        mode === 'ssr'
          ? ctx.locale
          : ctx.params?.[this.config.languageParamName];
      return middleware({
        locale: this.getLanguageWithFallback(
          typeof localeOfCtx === 'string' ? localeOfCtx : undefined,
        ),
      });
    };
  };
}
