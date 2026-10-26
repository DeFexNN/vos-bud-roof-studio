'use client';

import type { Locale } from '@/i18n/types';
import { messages } from '@/i18n/messages';
import { useRoof } from '@/configurator/State';
import { number } from '@/i18n/types';
import { ButtonLink, Eyebrow } from '@/components/ui';
import Hero from './Hero';
import { FeaturedProjects } from './Projects';
import { MaterialTeaser } from './Materials';
import { AnatomyFeature, Expertise, Faq, Process, Values } from './Editorial';
import CostSummary from '@/components/CostSummary';

export default function Home({ locale }: { locale: Locale }) {
  const d = messages[locale], { estimate } = useRoof();
  return <><Hero locale={locale} /><div className="capability-strip container"><span>{d.heroNote}</span><div><strong>04</strong>{d.supportedShapes}</div><div><strong>06</strong>{d.roofingSystems}</div><div><strong>10</strong>{d.realStories}</div><span className="mono">V / 2026</span></div>
    <Expertise locale={locale} /><FeaturedProjects locale={locale} /><MaterialTeaser locale={locale} /><AnatomyFeature locale={locale} /><Process locale={locale} />
    <section className="estimate-teaser"><div className="container estimate-teaser-grid"><div><Eyebrow>{d.assumptions.toUpperCase()}</Eyebrow><h2>{d.billTitle}</h2><p>{d.billIntro}</p><ButtonLink locale={locale} page="calculator">{d.professional}</ButtonLink></div><div className="teaser-summary"><div className="teaser-summary-label"><span className="mono">V / {d.currentConfig}</span><span>{number(estimate.geometry?.grossArea || 0, locale)} m²</span></div><CostSummary locale={locale} compact actions={false} /></div></div></section>
    <Values locale={locale} /><Faq locale={locale} />
  </>;
}
