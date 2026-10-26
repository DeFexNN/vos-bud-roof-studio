export type Locale = 'pl' | 'en';
export type Bilingual = Record<Locale, string>;
export const bi = (pl: string, en: string): Bilingual => ({ pl, en });
export function number(value: number, locale: Locale, decimals = 1) {
  return new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', { maximumFractionDigits: decimals }).format(value);
}
export function money(value: number, locale: Locale, decimals = 0) {
  return new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', {
    style: 'currency', currency: 'PLN', minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }).format(value);
}
