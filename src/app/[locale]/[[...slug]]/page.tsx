import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/types';
import { absolute, href, routes, type Page as PageId } from '@/lib/site';
import { projects, instagramUrl } from '@/data/projects';
import Shell from '@/components/Shell';
import Home from '@/sections/Home';
import { ProjectsIndex, ProjectDetail } from '@/sections/Projects';
import { ApproachPage } from '@/sections/Editorial';
import Materials from '@/sections/Materials';
import Studio from '@/sections/Studio';
import Contact from '@/sections/Contact';
import Privacy from '@/sections/Privacy';

export const dynamicParams = false;
export function generateStaticParams() {
  return (['pl', 'en'] as Locale[]).flatMap(locale => [
    ...Object.values(routes[locale]).map(route => ({ locale, slug: route ? [route] : [] })),
    ...projects.map(p => ({ locale, slug: [routes[locale].projects, p.id] })),
  ]);
}
type Params = Promise<{ locale: string; slug?: string[] }>;
function resolve(locale: string, slug: string[] = []) {
  if (locale !== 'pl' && locale !== 'en') return null;
  const page = (Object.keys(routes[locale]) as PageId[]).find(p => routes[locale][p] === (slug[0] || ''));
  if (!page || slug.length > 2 || (slug.length === 2 && (page !== 'projects' || !projects.some(p => p.id === slug[1])))) return null;
  return { locale: locale as Locale, page, project: slug[1] ? projects.find(p => p.id === slug[1]) : undefined };
}
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const raw = await params, route = resolve(raw.locale, raw.slug);
  if (!route) return {};
  const { locale, page, project } = route, d = messages[locale];
  const title = `${project?.title[locale] || (page === 'home' ? `${d.hero1} ${d.hero2} ${d.hero3}` : d.nav[page])} — V.O.S_BUD`;
  const descriptions: Record<PageId, string> = {
    home: d.heroBody, services: d.expertiseBody, projects: d.projectIndexBody, materials: d.materialsBody,
    studio: d.studioPageBody, calculator: d.billIntro, contact: d.contactBody,
    privacy: d.privacyBody.split('. ').slice(0, 2).join('. ') + '.',
  };
  const description = project?.description[locale] || descriptions[page];
  const url = absolute(href(locale, page, project?.id));
  return { title, description, alternates: { canonical: url, languages: {
    'pl-PL': absolute(href('pl', page, project?.id)), 'en-GB': absolute(href('en', page, project?.id)), 'x-default': absolute(href('pl', page, project?.id)),
  } }, openGraph: { title, description, url, siteName: 'V.O.S_BUD', type: 'website', locale: locale === 'pl' ? 'pl_PL' : 'en_GB', alternateLocale: locale === 'pl' ? 'en_GB' : 'pl_PL',
    images: [{ url: absolute(project ? `/images/projects/${project.number}-after-1600.webp` : '/og-cover.png'), width: project ? undefined : 1200, height: project ? undefined : 630, alt: project?.afterAlt[locale] || d.heroBody }] },
    twitter: { card: 'summary_large_image', title, description } };
}
export default async function Page({ params }: { params: Params }) {
  const raw = await params, route = resolve(raw.locale, raw.slug);
  if (!route) notFound();
  const { locale, page, project } = route, d = messages[locale];
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'V.O.S_BUD', url: absolute(href(locale)), inLanguage: locale, description: d.heroBody };
  const caseLd = project ? { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title[locale], description: project.description[locale], inLanguage: locale,
    image: absolute(`/images/projects/${project.number}-after-1600.webp`), isBasedOn: instagramUrl(project), creator: { '@type': 'Organization', name: 'V.O.S_BUD' } } : null;
  return <Shell locale={locale} page={page} projectId={project?.id}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />{caseLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseLd).replace(/</g, '\\u003c') }} />}
    {page === 'home' && <Home locale={locale} />}
    {page === 'services' && <ApproachPage locale={locale} />}
    {page === 'projects' && (project ? <ProjectDetail locale={locale} projectId={project.id} /> : <ProjectsIndex locale={locale} />)}
    {page === 'materials' && <Materials locale={locale} />}
    {(page === 'studio' || page === 'calculator') && <Studio locale={locale} calculator={page === 'calculator'} />}
    {page === 'contact' && <Contact locale={locale} />}
    {page === 'privacy' && <Privacy locale={locale} />}
  </Shell>;
}
