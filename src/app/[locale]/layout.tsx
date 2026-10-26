import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { messages } from '@/i18n/messages';
import { RoofProvider } from '@/configurator/State';
import { siteUrl } from '@/lib/site';
import { fontClasses } from '@/lib/fonts';
import '@/styles/globals.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = messages[locale === 'en' ? 'en' : 'pl'];
  return { metadataBase: new URL(siteUrl), title: `V.O.S_BUD — ${d.brandTag}`, description: d.heroBody,
    icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg` }, robots: { index: true, follow: true } };
}
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'pl' && locale !== 'en') notFound();
  return <html lang={locale} className={fontClasses} data-scroll-behavior="smooth"><body><RoofProvider locale={locale}>{children}</RoofProvider></body></html>;
}
