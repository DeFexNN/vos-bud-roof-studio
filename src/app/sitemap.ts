import type { MetadataRoute } from 'next';
import { routes, absolute, href, type Page } from '@/lib/site';
import { projects } from '@/data/projects';
import type { Locale } from '@/i18n/types';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return (['pl', 'en'] as Locale[]).flatMap(locale => [
    ...(Object.keys(routes[locale]) as Page[]).map(page => ({ url: absolute(href(locale, page)), changeFrequency: 'monthly' as const, priority: page === 'home' ? 1 : .8,
      alternates: { languages: { pl: absolute(href('pl', page)), en: absolute(href('en', page)) } } })),
    ...projects.map(p => ({ url: absolute(href(locale, 'projects', p.id)), changeFrequency: 'yearly' as const, priority: .7,
      alternates: { languages: { pl: absolute(href('pl', 'projects', p.id)), en: absolute(href('en', 'projects', p.id)) } } })),
  ]);
}
