/* eslint-disable */
interface TSignature {
  (...args: any[]): string;
  rich(...args: any[]): string;
}
const t: TSignature = () => '';
t.rich = () => '';

const useTranslations: (ns?: string) => TSignature = () => t;

const hookCall = useTranslations()('includes.a');
const hookRichCall = useTranslations().rich('includes.b');
const call = t('includes.c');
const richCall = t('includes.d');

const map = {
  e: (t: TSignature) => t('includes.e'),
  f: (t: TSignature) => t.rich('includes.f'),
};

const CompA = () => {
  return (
    <>
      {useTranslations()('includes.g')}
      {useTranslations().rich('includes.h')}
    </>
  );
};

const CompB = () => {
  const text = t.rich('includes.i', {});
  return <>{text}</>;
};

// ignore
useTranslations('ignores.a');
const tt = (key: string) => '';
tt('ignores.b');
