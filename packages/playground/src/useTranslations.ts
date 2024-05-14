interface TSignature {
  (key: string, vars?: any): string;
  rich: (key: string, vars?: any) => string;
}

type UseTranslations = () => TSignature;

export const useTranslations: UseTranslations = () => {
  const t: TSignature = () => '';
  t.rich = () => '';
  return t;
};
